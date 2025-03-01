'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import Link from 'next/link';

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <Link href="/" className="text-xl">
          LearnFi
        </Link>
      </div>
      <div className="navbar-end">
        {isConnected ? <ConnectButton /> : <WalletConnectButton />}
      </div>
    </div>
  );
}
