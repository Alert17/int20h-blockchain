import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet],
    },
  ],
  {
    appName: 'LearnFi',
    projectId: process.env.RAINBOWKIT_PROJECT_ID!,
  }
);

export const config = createConfig({
  chains: [mainnet, polygon],
  ssr: true,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
});
