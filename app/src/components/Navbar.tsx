'use client';
import { useAccount } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Gavel, Package, History, User } from 'lucide-react';

export function Navbar() {
  const { isConnected } = useAccount();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 max-w-screen-xl mx-auto">
        <div className="mr-auto flex items-center gap-2">
          <Gavel className="h-5 w-5 text-primary" />
          <Link href="/" className="text-xl font-bold tracking-wider">
            NEVERHOLD
          </Link>
        </div>
        
        {isConnected && (
          <div className="hidden md:flex items-center gap-6 mx-4">
            <Link href="/auctions" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <Package className="h-4 w-4" />
              <span>Auctions</span>
            </Link>
            <Link href="/my-bids" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <History className="h-4 w-4" />
              <span>My Bids</span>
            </Link>
            {/* <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link> */}
          </div>
        )}
        
        <div className="ml-auto">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
          ) : (
            <WalletConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}
