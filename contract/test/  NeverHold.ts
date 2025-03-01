import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("NeverHold and RWANFT Tests", () => {
	let NeverHold: any, RWANFT: any;
	let neverHold: Contract, rwaNFT: Contract;
	let owner: Signer, seller: Signer, bidder1: Signer, bidder2: Signer;

	beforeEach(async () => {
		[owner, seller, bidder1, bidder2] = await ethers.getSigners();

		const RWANFTFactory = await ethers.getContractFactory("RWANFT");
		rwaNFT = await RWANFTFactory.deploy();
		await rwaNFT.waitForDeployment();

		const NeverHoldFactory = await ethers.getContractFactory("NeverHold");
		neverHold = await NeverHoldFactory.deploy();
		await neverHold.waitForDeployment();

		await rwaNFT.connect(owner).setAuctionHouse(neverHold.target);
		await neverHold.connect(owner).setRWANFTContract(rwaNFT.target);
	});

	describe("Deployment", () => {
		it("Should deploy with correct initial values", async () => {
			expect(await neverHold.creationFee()).to.equal(ethers.parseEther("0.01"));
			expect(await neverHold.commissionPercent()).to.equal(5);
			expect(await neverHold.rwaNFTContract()).to.equal(rwaNFT.target);
			expect(await rwaNFT.auctionHouse()).to.equal(neverHold.target);
		});
	});

	describe("Auction Creation", () => {
		it("Should create an English auction", async () => {
			const tx = await neverHold.connect(seller).createAuction(
				"Test Auction",
				0, // ENGLISH
				ethers.ZeroAddress,
				ethers.parseEther("1"),
				ethers.parseEther("0.1"),
				ethers.parseEther("10"),
				Math.floor(Date.now() / 1000) + 3600,
				ethers.ZeroAddress,
				0,
				0,
				false,
				false,
				1,
				true,
				true,
				"ipfs://test",
				0,
				0,
				{ value: ethers.parseEther("0.01") }
			);
			const receipt = await tx.wait();
			expect(receipt)
				.to.emit(neverHold, "AuctionCreated")
				.withArgs(1, seller.address, "Test Auction", 0, receipt.block.timestamp);
		});
	});

	describe("Bidding", () => {
		beforeEach(async () => {
			await neverHold.connect(seller).createAuction(
				"Test Auction",
				0, // ENGLISH
				ethers.ZeroAddress,
				ethers.parseEther("1"),
				ethers.parseEther("0.1"),
				ethers.parseEther("10"),
				Math.floor(Date.now() / 1000) + 3600,
				ethers.ZeroAddress,
				0,
				0,
				false,
				false,
				1,
				true,
				true,
				"ipfs://test",
				0,
				0,
				{ value: ethers.parseEther("0.01") }
			);
		});

		it("Should allow bidding on English auction", async () => {
			await expect(
				neverHold.connect(bidder1).placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") })
			)
				.to.emit(neverHold, "BidPlaced")
				.withArgs(1, bidder1.address, ethers.parseEther("1.5"));
		});

		it("Should reject low bid", async () => {
			await expect(
				neverHold.connect(bidder1).placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("0.5") })
			).to.be.revertedWith("Bid too low");
		});
	});

	describe("Auction Ending", () => {
		beforeEach(async () => {
			await neverHold.connect(seller).createAuction(
				"Test Auction",
				0, // ENGLISH
				ethers.ZeroAddress,
				ethers.parseEther("1"),
				ethers.parseEther("0.1"),
				ethers.parseEther("10"),
				Math.floor(Date.now() / 1000) + 3600,
				ethers.ZeroAddress,
				0,
				0,
				false,
				false,
				1,
				true,
				true,
				"ipfs://test",
				0,
				0,
				{ value: ethers.parseEther("0.01") }
			);
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") });
			await neverHold
				.connect(bidder2)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("2") });
		});

		it("Should end auction and mint NFT", async () => {
			await ethers.provider.send("evm_increaseTime", [3600]);
			await ethers.provider.send("evm_mine", []);

			await expect(neverHold.connect(seller).endAuction(1))
				.to.emit(neverHold, "AuctionEnded")
				.to.emit(neverHold, "RWANFTMinted")
				.withArgs(1, 0, bidder2.address);

			expect(await rwaNFT.ownerOf(0)).to.equal(bidder2.address);
			expect(await rwaNFT.auctionIds(0)).to.equal(1);
		});
	});

	describe("Reward Claiming", () => {
		beforeEach(async () => {
			await neverHold.connect(seller).createAuction(
				"Test Auction",
				0, // ENGLISH
				ethers.ZeroAddress,
				ethers.parseEther("1"),
				ethers.parseEther("0.1"),
				ethers.parseEther("10"),
				Math.floor(Date.now() / 1000) + 3600,
				ethers.ZeroAddress,
				0,
				0,
				false,
				false,
				1,
				true,
				true,
				"ipfs://test",
				0,
				0,
				{ value: ethers.parseEther("0.01") }
			);
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") });
			await ethers.provider.send("evm_increaseTime", [3600]);
			await ethers.provider.send("evm_mine", []);
			await neverHold.connect(seller).endAuction(1);
		});

		it("Should allow winner to claim reward", async () => {
			await expect(rwaNFT.connect(bidder1).claimReward(0))
				.to.emit(rwaNFT, "RewardClaimed")
				.withArgs(0, bidder1.address);
			expect(await rwaNFT.isClaimed(0)).to.be.true;
		});

		it("Should reject claim by non-owner", async () => {
			await expect(rwaNFT.connect(bidder2).claimReward(0)).to.be.revertedWith("Not token owner");
		});

		it("Should reject double claim", async () => {
			await rwaNFT.connect(bidder1).claimReward(0);
			await expect(rwaNFT.connect(bidder1).claimReward(0)).to.be.revertedWith(
				"Reward already claimed"
			);
		});
	});

	describe("Charity Auction", () => {
		beforeEach(async () => {
			await neverHold.connect(seller).createAuction(
				"Charity Auction",
				4, // CHARITY
				ethers.ZeroAddress,
				ethers.parseEther("1"),
				ethers.parseEther("0.1"),
				ethers.parseEther("10"),
				Math.floor(Date.now() / 1000) + 3600,
				ethers.ZeroAddress,
				0,
				0,
				false,
				false,
				2, // 2 winners
				true,
				true,
				"ipfs://test",
				0,
				0,
				{ value: ethers.parseEther("0.01") }
			);
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1") });
			await neverHold
				.connect(bidder2)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("2") });
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1") }); // Additional donation
		});

		it("Should end charity auction and mint NFTs to top donors", async () => {
			await ethers.provider.send("evm_increaseTime", [3600]);
			await ethers.provider.send("evm_mine", []);

			const tx = await neverHold.connect(seller).endAuction(1);
			await expect(tx)
				.to.emit(neverHold, "AuctionEnded")
				.to.emit(neverHold, "RWANFTMinted")
				.withArgs(1, 0, bidder2.address) // bidder2 donated 2 ETH
				.to.emit(neverHold, "RWANFTMinted")
				.withArgs(1, 1, bidder1.address); // bidder1 donated 2 ETH total

			expect(await rwaNFT.ownerOf(0)).to.equal(bidder2.address);
			expect(await rwaNFT.ownerOf(1)).to.equal(bidder1.address);
			expect(await rwaNFT.auctionIds(0)).to.equal(1);
			expect(await rwaNFT.auctionIds(1)).to.equal(1);
		});
	});
});
