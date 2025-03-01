'use client';
import { Gavel, History, Package, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import { Button } from './ui/button';

export function Navbar() {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className="border-b">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center px-4">
        <div className="mr-auto flex items-center gap-2">
          <Gavel className="h-5 w-5 text-primary" />
          <Link href="/" className="text-xl font-bold tracking-wider">
            NEVERHOLD
          </Link>
        </div>

        {isConnected && (
          <div className="mx-4 hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard/auctions"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
              <Package className="h-4 w-4" />
              <span>Auctions</span>
            </Link>
            <Link
              href="/dashboard/home"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary"
            >
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Connected</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" />
                <span>Disconnect</span>
              </Button>
            </div>
          ) : (
            <WalletConnectButton />
          )}
        </div>
      </div>
    </div>
  );
}
