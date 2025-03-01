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
	},
};

export default config;
