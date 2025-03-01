import { expect } from "chai";
import { ethers } from "hardhat";
import { NeverHold, RWANFT } from "../typechain-types";

describe("NeverHold and RWANFT Detailed Tests", () => {
	let neverHold: NeverHold;
	let rwaNFT: RWANFT;
	let owner: any, seller: any, bidder1: any, bidder2: any, bidder3: any;

	beforeEach(async () => {
		[owner, seller, bidder1, bidder2, bidder3] = await ethers.getSigners();

		const RWANFTFactory = await ethers.getContractFactory("RWANFT");
		rwaNFT = (await RWANFTFactory.deploy()) as RWANFT;
		await rwaNFT.waitForDeployment();

		const NeverHoldFactory = await ethers.getContractFactory("NeverHold");
		neverHold = (await NeverHoldFactory.deploy()) as NeverHold;
		await neverHold.waitForDeployment();

		await rwaNFT.connect(owner).setAuctionHouse(neverHold.target);
		await neverHold.connect(owner).setRWANFTContract(rwaNFT.target);
	});

	async function getCurrentTimestamp(): Promise<number> {
		const block = await ethers.provider.getBlock("latest");
		if (!block) return 0;
		return block.timestamp;
	}

	describe("Deployment", () => {
		it("Should deploy with correct initial values", async () => {
			expect(await neverHold.creationFee()).to.equal(ethers.parseEther("0.01"));
			expect(await neverHold.commissionPercent()).to.equal(5);
			expect(await neverHold.rwaNFTContract()).to.equal(rwaNFT.target);
			expect(await rwaNFT.auctionHouse()).to.equal(neverHold.target);
		});
	});

	describe("English Auction", () => {
		const params = async () => ({
			name: "English Auction",
			auctionType: 0,
			tokenAddress: ethers.ZeroAddress,
			startPrice: ethers.parseEther("1"),
			minBidIncrement: ethers.parseEther("0.1"),
			maxPrice: ethers.parseEther("10"),
			endTime: (await getCurrentTimestamp()) + 3600,
			rewardToken: ethers.ZeroAddress,
			rewardTokenId: 0,
			rewardAmount: 0,
			isERC721: false,
			isERC1155: false,
			numWinners: 1,
			canCloseEarly: true,
			isRWA: true,
			rwaTokenURI: "ipfs://english",
			dutchPriceDecrement: 0,
			sealedBidRevealTime: 0,
		});

		beforeEach(async () => {
			await neverHold
				.connect(seller)
				.createAuction(await params(), { value: ethers.parseEther("0.01") });
		});

		it("Should allow bidding and end with winner getting RWA NFT", async () => {
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") });
			await neverHold
				.connect(bidder2)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("2") });
			await ethers.provider.send("evm_increaseTime", [3600]);
			await ethers.provider.send("evm_mine", []);

			const tx = await neverHold.connect(seller).endAuction(1);
			await expect(tx)
				.to.emit(neverHold, "AuctionEnded")
				.withArgs(1, [bidder2.address], [ethers.parseEther("2")])
				.to.emit(neverHold, "RWANFTMinted")
				.withArgs(1, 0, bidder2.address);

			expect(await rwaNFT.ownerOf(0)).to.equal(bidder2.address);
			expect(await rwaNFT.auctionIds(0)).to.equal(1);
			expect(await rwaNFT.tokenURI(0)).to.equal("ipfs://english");
		});

		it("Should refund losing bidder", async () => {
			const bidder1BalanceBefore = await ethers.provider.getBalance(bidder1.address);
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") });
			await neverHold
				.connect(bidder2)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("2") });
			await ethers.provider.send("evm_increaseTime", [3600]);
			await ethers.provider.send("evm_mine", []);
			await neverHold.connect(seller).endAuction(1);

			const bidder1BalanceAfter = await ethers.provider.getBalance(bidder1.address);
			expect(bidder1BalanceAfter).to.be.closeTo(bidder1BalanceBefore, ethers.parseEther("0.01"));
		});
	});

	describe("Dutch Auction", () => {
		const params = async () => ({
			name: "Dutch Auction",
			auctionType: 1,
			tokenAddress: ethers.ZeroAddress,
			startPrice: ethers.parseEther("10"),
			minBidIncrement: 0,
			maxPrice: 0,
			endTime: (await getCurrentTimestamp()) + 3600,
			rewardToken: ethers.ZeroAddress,
			rewardTokenId: 0,
			rewardAmount: 0,
			isERC721: false,
			isERC1155: false,
			numWinners: 1,
			canCloseEarly: true,
			isRWA: true,
			rwaTokenURI: "ipfs://dutch",
			dutchPriceDecrement: ethers.parseEther("1"),
			sealedBidRevealTime: 0,
		});

		beforeEach(async () => {
			await neverHold
				.connect(seller)
				.createAuction(await params(), { value: ethers.parseEther("0.01") });
		});

		it("Should accept first bid and end immediately", async () => {
			const bidTx = await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("10") });
			await expect(bidTx)
				.to.emit(neverHold, "BidPlaced")
				.withArgs(1, bidder1.address, ethers.parseEther("10"));

			// Проверяем, что аукцион стал неактивным
			const auction = await neverHold.auctions(1);
			expect(auction.active).to.be.false;
		});
	});

	describe("Sealed Bid Auction", () => {
		const params = async () => ({
			name: "Sealed Bid Auction",
			auctionType: 2,
			tokenAddress: ethers.ZeroAddress,
			startPrice: ethers.parseEther("1"),
			minBidIncrement: 0,
			maxPrice: 0,
			endTime: (await getCurrentTimestamp()) + 3600,
			rewardToken: ethers.ZeroAddress,
			rewardTokenId: 0,
			rewardAmount: 0,
			isERC721: false,
			isERC1155: false,
			numWinners: 1,
			canCloseEarly: true,
			isRWA: true,
			rwaTokenURI: "ipfs://sealed",
			dutchPriceDecrement: 0,
			sealedBidRevealTime: (await getCurrentTimestamp()) + 1800,
		});

		beforeEach(async () => {
			await neverHold
				.connect(seller)
				.createAuction(await params(), { value: ethers.parseEther("0.01") });
		});

		it("Should handle sealed bids and reveal winner", async () => {
			const secret1 = ethers.encodeBytes32String("secret1");
			const secret2 = ethers.encodeBytes32String("secret2");
			const bid1 = ethers.parseEther("2");
			const bid2 = ethers.parseEther("3");
			const sealedBid1 = ethers.keccak256(
				ethers.solidityPacked(["uint256", "bytes32"], [bid1, secret1])
			);
			const sealedBid2 = ethers.keccak256(
				ethers.solidityPacked(["uint256", "bytes32"], [bid2, secret2])
			);

			await neverHold.connect(bidder1).placeBid(1, sealedBid1, { value: ethers.parseEther("2") });
			await neverHold.connect(bidder2).placeBid(1, sealedBid2, { value: ethers.parseEther("3") });

			await ethers.provider.send("evm_increaseTime", [1800]);
			await ethers.provider.send("evm_mine", []);

			await neverHold.connect(bidder1).revealSealedBid(1, bid1, secret1);
			await neverHold.connect(bidder2).revealSealedBid(1, bid2, secret2);

			await ethers.provider.send("evm_increaseTime", [1800]);
			await ethers.provider.send("evm_mine", []);

			await expect(neverHold.connect(seller).endAuction(1))
				.to.emit(neverHold, "RWANFTMinted")
				.withArgs(1, 0, bidder2.address);
		});
	});

	describe("Time Based Auction", () => {
		const params = async () => ({
			name: "Time Based Auction",
			auctionType: 3,
			tokenAddress: ethers.ZeroAddress,
			startPrice: ethers.parseEther("1"),
			minBidIncrement: ethers.parseEther("0.1"),
			maxPrice: ethers.parseEther("10"),
			endTime: (await getCurrentTimestamp()) + 3600,
			rewardToken: ethers.ZeroAddress,
			rewardTokenId: 0,
			rewardAmount: 0,
			isERC721: false,
			isERC1155: false,
			numWinners: 1,
			canCloseEarly: true,
			isRWA: true,
			rwaTokenURI: "ipfs://time",
			dutchPriceDecrement: 0,
			sealedBidRevealTime: 0,
		});

		beforeEach(async () => {
			await neverHold
				.connect(seller)
				.createAuction(await params(), { value: ethers.parseEther("0.01") });
		});

		it("Should extend time on late  award winner", async () => {
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") });
			await ethers.provider.send("evm_increaseTime", [3300]);
			await neverHold
				.connect(bidder2)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("2") });
			await ethers.provider.send("evm_increaseTime", [600]);
			await ethers.provider.send("evm_mine", []);

			await expect(neverHold.connect(seller).endAuction(1))
				.to.emit(neverHold, "RWANFTMinted")
				.withArgs(1, 0, bidder2.address);
		});
	});

	describe("Charity Auction", () => {
		const params = async () => ({
			name: "Charity Auction",
			auctionType: 4,
			tokenAddress: ethers.ZeroAddress,
			startPrice: ethers.parseEther("1"),
			minBidIncrement: 0,
			maxPrice: 0,
			endTime: (await getCurrentTimestamp()) + 3600,
			rewardToken: ethers.ZeroAddress,
			rewardTokenId: 0,
			rewardAmount: 0,
			isERC721: false,
			isERC1155: false,
			numWinners: 2,
			canCloseEarly: true,
			isRWA: true,
			rwaTokenURI: "ipfs://charity",
			dutchPriceDecrement: 0,
			sealedBidRevealTime: 0,
		});

		beforeEach(async () => {
			await neverHold
				.connect(seller)
				.createAuction(await params(), { value: ethers.parseEther("0.01") });
		});

		it("Should award top donors with RWA NFTs", async () => {
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1") });
			await neverHold
				.connect(bidder2)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("2") });
			await neverHold
				.connect(bidder3)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1.5") });
			await neverHold
				.connect(bidder1)
				.placeBid(1, ethers.ZeroHash, { value: ethers.parseEther("1") });

			await ethers.provider.send("evm_increaseTime", [3600]);
			await ethers.provider.send("evm_mine", []);

			const tx = await neverHold.connect(seller).endAuction(1);
			const receipt = await tx.wait();

			if (!receipt) return;

			const mintedEvents = receipt.logs
				.filter((log) => log.topics[0] === ethers.id("RWANFTMinted(uint256,uint256,address)"))
				.map((log) => neverHold.interface.parseLog(log));

			expect(mintedEvents.length).to.equal(2);
			const winners = mintedEvents.map((event) => {
				if (!event) return 0;
				event.args.winner;
			});

			expect(await rwaNFT.ownerOf(0)).to.be.oneOf([bidder1.address, bidder2.address]);
			expect(await rwaNFT.ownerOf(1)).to.be.oneOf([bidder1.address, bidder2.address]);
			expect(await rwaNFT.ownerOf(0)).to.not.equal(await rwaNFT.ownerOf(1));
		});
	});

	describe("Reward Claiming", () => {
		const params = async () => ({
			name: "Test Auction",
			auctionType: 0,
			tokenAddress: ethers.ZeroAddress,
			startPrice: ethers.parseEther("1"),
			minBidIncrement: ethers.parseEther("0.1"),
			maxPrice: ethers.parseEther("10"),
			endTime: (await getCurrentTimestamp()) + 3600,
			rewardToken: ethers.ZeroAddress,
			rewardTokenId: 0,
			rewardAmount: 0,
			isERC721: false,
			isERC1155: false,
			numWinners: 1,
			canCloseEarly: true,
			isRWA: true,
			rwaTokenURI: "ipfs://test",
			dutchPriceDecrement: 0,
			sealedBidRevealTime: 0,
		});

		beforeEach(async () => {
			await neverHold
				.connect(seller)
				.createAuction(await params(), { value: ethers.parseEther("0.01") });
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
	});
});
