import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.20",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
			viaIR: true,
		},
	},
	networks: {
		hardhat: {
			chainId: 1337,
		},
		sepolia: {
			url: "https://eth-sepolia.api.onfinality.io/public",
			accounts: [process.env.PRIVATE_KEY || ""],
		},
		ethereum: {
			url: "https://eth.blockrazor.xyz",
			accounts: [process.env.PRIVATE_KEY || ""],
			chainId: 1,
		},
		polygon: {
			url: "https://polygon-rpc.com",
			accounts: [process.env.PRIVATE_KEY || ""],
			chainId: 137,
		},
		arbitrum: {
			url: "https://arb1.arbitrum.io/rpc",
			accounts: [process.env.PRIVATE_KEY || ""],
			chainId: 42161,
		},
		base: {
			url: "https://mainnet.base.org",
			accounts: [process.env.PRIVATE_KEY || ""],
			chainId: 8453,
		},
	},
};

export default config;
