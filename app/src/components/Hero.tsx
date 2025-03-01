'use client';
import { useAccount } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import { Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Hero() {
  const { isConnected } = useAccount();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-3xl font-bold tracking-wider">NEVERHOLD</div>

      <div className="mb-8">
        <Gavel className="mx-auto h-16 w-16 text-primary" />
      </div>

      <h1 className="mb-2 text-4xl font-bold">Decentralized Crypto Auctions</h1>

      <p className="mb-8 max-w-md text-muted-foreground">
        Buy, Sell, and Trade Digital Assets with Transparent Blockchain Fees
      </p>

      <div
        className={cn(
          'transition-all duration-300',
          isConnected ? 'h-0 opacity-0' : 'h-auto opacity-100'
        )}
      >
        <WalletConnectButton />
      </div>

      {isConnected && (
        <div className="flex animate-fade-in flex-col gap-4">
          <div className="text-xl font-medium text-primary">
            Connected! Ready to start bidding?
          </div>
          <div className="flex gap-4">
            <a
              href="/dashboard/auctions"
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse Auctions
            </a>
            <a
              href="/dashboard/create-auction"
              className="rounded-md bg-secondary px-4 py-2 font-medium text-secondary-foreground hover:bg-secondary/90"
            >
              Create Auction
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
