import { ethers } from "hardhat";
import { NeverHold, RWANFT } from "../typechain-types";

async function main() {
	// Получаем аккаунт для деплоя
	const [deployer] = await ethers.getSigners();
	console.log("Deploying contracts with account:", deployer.address);

	// Проверяем баланс
	const balance = await ethers.provider.getBalance(deployer.address);
	console.log("Account balance:", ethers.formatEther(balance), "ETH");

	// Разворачиваем RWANFT
	console.log("Deploying RWANFT...");
	const RWANFTFactory = await ethers.getContractFactory("RWANFT", deployer);
	const rwaNFT: RWANFT = (await RWANFTFactory.deploy()) as RWANFT;
	await rwaNFT.waitForDeployment();
	const rwaNFTAddress = await rwaNFT.getAddress();
	console.log("RWANFT deployed to:", rwaNFTAddress);

	// Разворачиваем NeverHold
	console.log("Deploying NeverHold...");
	const NeverHoldFactory = await ethers.getContractFactory("NeverHold", deployer);
	const neverHold: NeverHold = (await NeverHoldFactory.deploy()) as NeverHold;
	await neverHold.waitForDeployment();
	const neverHoldAddress = await neverHold.getAddress();
	console.log("NeverHold deployed to:", neverHoldAddress);

	// Настраиваем взаимосвязи
	console.log("Setting auction house in RWANFT...");
	const tx1 = await rwaNFT.connect(deployer).setAuctionHouse(neverHoldAddress);
	await tx1.wait();
	console.log("Auction house set to:", neverHoldAddress);

	console.log("Setting RWANFT in NeverHold...");
	const tx2 = await neverHold.connect(deployer).setRWANFTContract(rwaNFTAddress);
	await tx2.wait();
	console.log("RWANFT set to:", rwaNFTAddress);

	// Проверка конфигурации
	console.log("Verifying configuration...");
	const auctionHouse = await rwaNFT.auctionHouse();
	const rwaNFTContract = await neverHold.rwaNFTContract();
	if (auctionHouse !== neverHoldAddress) throw new Error("Failed to set auction house");
	if (rwaNFTContract !== rwaNFTAddress) throw new Error("Failed to set RWANFT contract");
	console.log("Configuration verified successfully!");

	console.log("Deployment completed!");
	console.log("RWANFT address:", rwaNFTAddress);
	console.log("NeverHold address:", neverHoldAddress);
}

main()
	.then(() => {
		console.log("Script executed successfully");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Deployment failed with error:", error);
		process.exit(1);
	});
