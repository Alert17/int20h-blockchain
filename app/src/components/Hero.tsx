'use client';
import { useAccount } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import { Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Hero() {
  const { isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="mb-8 text-3xl font-bold tracking-wider">
        NEVERHOLD
      </div>
      
      <div className="mb-8">
        <Gavel className="h-16 w-16 mx-auto text-primary" />
      </div>
      
      <h1 className="text-4xl font-bold mb-2">
        Decentralized Crypto Auctions
      </h1>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        Buy, Sell, and Trade Digital Assets with Zero Holding Fees
      </p>
      
      <div className={cn(
        "transition-all duration-300",
        isConnected ? "opacity-0 h-0" : "opacity-100 h-auto"
      )}>
        <WalletConnectButton />
      </div>
      
      {isConnected && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <div className="text-xl font-medium text-primary">
            Connected! Ready to start bidding?
          </div>
          <div className="flex gap-4">
            <a href="/auctions" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium">
              Browse Auctions
            </a>
            <a href="/create" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md font-medium">
              Create Auction
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
