# NeverHold Auction Platform

NeverHold is a decentralized auction platform built on Ethereum, supporting multiple auction types and tokenized real-world assets (RWA) via NFTs. This project includes smart contracts deployed with Hardhat and a React-based frontend integrated with Web3.js and MetaMask for user interaction.

## Technologies Used

- **Solidity**: Smart contracts written in Solidity (version ^0.8.20) using OpenZeppelin libraries for ERC20, ERC721, and ERC1155 token standards.
- **Hardhat**: Development environment for compiling, testing, and deploying smart contracts.
- **React**: Frontend framework for building the user interface.
- **Web3.js**: JavaScript library for interacting with Ethereum blockchain and smart contracts.
- **MetaMask**: Browser extension for Ethereum wallet management and transaction signing.
- **OpenZeppelin Contracts**: Reusable, secure smart contract components for token standards and ownership control.

## Smart Contracts Overview

### 1. `NeverHold.sol`
The core auction contract that supports multiple auction types and manages bidding, commission, and rewards.

- **Key Features**:
  - Supports five auction types: English, Dutch, Sealed-Bid, Time-Based, and Charity.
  - Handles ETH-based bidding and token rewards (ERC20, ERC721, ERC1155).
  - Integrates Real-World Asset (RWA) NFTs via the `RWANFT` contract.
  - Configurable creation fees and commission percentages (owned by the contract deployer).
  - Events for auction creation, bids, endings, and RWA NFT minting.

- **How It Works**:
  - Users create auctions with parameters (e.g., start price, end time, auction type).
  - Bidders place bids based on the auction type (e.g., incremental bids for English, fixed price for Dutch).
  - Auction owners can end auctions, distributing proceeds (minus commission) and minting RWA NFTs for winners.

### 2. `RWANFT.sol`
An ERC721 NFT contract for minting and managing RWA tokens tied to auctions.

- **Key Features**:
  - Mints NFTs for auction winners with a unique token URI linking to RWA metadata.
  - Tracks auction IDs and reward claim status.
  - Only the `NeverHold` contract can mint NFTs (via `onlyAuctionHouse` modifier).
  - Allows the owner to update token URIs.

- **How It Works**:
  - After an auction ends, the `NeverHold` contract calls `mintRWA` to issue NFTs to winners.
  - Winners can claim rewards tied to their NFTs, tracked on-chain.

## Frontend Overview

The React-based UI connects to the Ethereum blockchain via Web3.js and MetaMask, enabling users to:
- Create auctions by specifying parameters (name, type, price, etc.).
- View active auctions and place bids using ETH.
- End auctions (for sellers) and claim RWA NFTs or rewards (for winners).
- Interact with the `NeverHold` and `RWANFT` contracts seamlessly.

## How It Works

1. **Setup**:
   - Deploy `RWANFT.sol` and `NeverHold.sol` using Hardhat.
   - Set the `RWANFT` contract address in `NeverHold` via `setRWANFTContract`.

2. **Auction Creation**:
   - Users connect MetaMask, provide auction details, and pay the creation fee.
   - The `createAuction` function initializes the auction on-chain.

3. **Bidding**:
   - Depending on the auction type, users submit bids (e.g., ETH for English auctions, sealed bids with a secret for Sealed-Bid).
   - The contract updates the state (current price, bidders) and emits events.

4. **Auction Completion**:
   - The seller ends the auction manually (if `canCloseEarly` is true) or after the end time.
   - Winners receive RWA NFTs, the seller gets proceeds (minus commission), and losers are refunded.

5. **Reward Claiming**:
   - Winners use the frontend to call `claimReward` on the `RWANFT` contract, marking their reward as claimed.

## Prerequisites

- Node.js and npm installed.
- Hardhat for smart contract development.
- MetaMask browser extension.
- An Ethereum testnet/mainnet account with ETH for gas fees.

## Getting Started


1. **Install Dependencies**:
npm install


2. **Deploy Contracts**:
- Create .env file and add PRIVATE_KEY
- Configure Hardhat (`hardhat.config.js`) with your network and private key.
- Run:
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network-name>


3. **Run the Frontend**:
cd ui
npm install
npm start


4. **Connect MetaMask**:
- Open the app in your browser, connect MetaMask, and switch to the deployed network.

## License

This project is licensed under the MIT License - see the contracts' SPDX headers for details.
