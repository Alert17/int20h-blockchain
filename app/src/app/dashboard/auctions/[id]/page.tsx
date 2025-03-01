'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ethers } from 'ethers';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  XCircle,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../../../../hooks/useEthersSigner';
import { getContract } from '../../../../lib/contract';

// Enum for auction types from the contract
enum AuctionType {
  ENGLISH,
  DUTCH,
  SEALED_BID,
  TIME_BASED,
  CHARITY,
}

// Interface for auction data
interface AuctionData {
  seller: string;
  name: string;
  auctionType: AuctionType;
  tokenAddress: string;
  startPrice: bigint;
  currentPrice: bigint;
  minBidIncrement: bigint;
  maxPrice: bigint;
  endTime: bigint;
  createdAt: bigint;
  active: boolean;
  rewardToken: string;
  rewardTokenId: bigint;
  rewardAmount: bigint;
  isERC721: boolean;
  isERC1155: boolean;
  numWinners: bigint;
  canCloseEarly: boolean;
  isRWA: boolean;
  rwaTokenURI: string;
  dutchPriceDecrement: bigint;
  sealedBidRevealTime: bigint;
  bidders?: string[];
  bids?: Record<string, bigint>;
}

export default function AuctionPage() {
  const params = useParams();
  const auctionId = params.id as string;
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [currentDutchPrice, setCurrentDutchPrice] = useState<bigint | null>(
    null
  );

  // Function to fetch auction details
  const fetchAuctionDetails = async () => {
    if (!signer) return;

    try {
      setLoading(true);
      const contract = getContract(signer);

      // Get auction details
      const auctionData = await contract.auctions(auctionId);
      console.log('[AuctionPage INFO]: Fetched auction details', {
        auctionId,
        auctionData,
      });

      // Check if user is the owner
      const isOwner =
        auctionData.seller.toLowerCase() === address?.toLowerCase();
      setIsOwner(isOwner);

      // Get current Dutch price if applicable
      if (auctionData.auctionType === AuctionType.DUTCH && auctionData.active) {
        const dutchPrice = await contract.getDutchCurrentPrice(auctionId);
        setCurrentDutchPrice(dutchPrice);
      }

      setAuction(auctionData);
    } catch (error) {
      console.error('[AuctionPage ERROR]: Failed to fetch auction details', {
        auctionId,
        error,
      });
      toast.error('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  // Function to update time left
  const updateTimeLeft = () => {
    if (!auction) return;

    const endTime = Number(auction.endTime) * 1000; // Convert to milliseconds
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) {
      setTimeLeft('Ended');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    } else if (hours > 0) {
      setTimeLeft(`${hours}h ${minutes}m`);
    } else {
      setTimeLeft(`${minutes}m`);
    }
  };

  // Function to place a bid
  const placeBid = async () => {
    if (!signer || !auction || !bidAmount) return;

    try {
      const contract = getContract(signer);
      const bidAmountWei = ethers.parseEther(bidAmount);

      // For sealed bid auctions, we would need to implement the hashing logic
      // For simplicity, we're just handling regular bids here
      const tx = await contract.placeBid(auctionId, ethers.ZeroHash, {
        value: bidAmountWei,
      });

      toast.loading('Placing bid...');
      await tx.wait();

      console.log('[AuctionPage INFO]: Bid placed successfully', {
        auctionId,
        bidAmount,
      });
      toast.success('Bid placed successfully!');

      // Refresh auction details
      fetchAuctionDetails();
      setBidAmount('');
    } catch (error) {
      console.error('[AuctionPage ERROR]: Failed to place bid', {
        auctionId,
        bidAmount,
        error,
      });
      toast.error(
        'Failed to place bid. Please check your input and try again.'
      );
    }
  };

  // Function to end auction (for auction owner)
  const endAuction = async () => {
    if (!signer || !auction || !isOwner) return;

    try {
      const contract = getContract(signer);
      const tx = await contract.endAuction(auctionId);

      toast.loading('Ending auction...');
      await tx.wait();

      console.log('[AuctionPage INFO]: Auction ended successfully', {
        auctionId,
      });
      toast.success('Auction ended successfully!');

      // Refresh auction details
      fetchAuctionDetails();
    } catch (error) {
      console.error('[AuctionPage ERROR]: Failed to end auction', {
        auctionId,
        error,
      });
      toast.error('Failed to end auction. Please try again.');
    }
  };

  // Get auction type as string
  const getAuctionTypeString = (type: AuctionType) => {
    switch (type) {
      case AuctionType.ENGLISH:
        return 'English';
      case AuctionType.DUTCH:
        return 'Dutch';
      case AuctionType.SEALED_BID:
        return 'Sealed Bid';
      case AuctionType.TIME_BASED:
        return 'Time-Based';
      case AuctionType.CHARITY:
        return 'Charity';
      default:
        return 'Unknown';
    }
  };

  // Initialize data and set up timer
  useEffect(() => {
    if (signer) {
      fetchAuctionDetails();
    }
  }, [signer, auctionId, address]);

  // Update time left every second
  useEffect(() => {
    if (auction) {
      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [auction]);

  // Update Dutch price every 5 seconds if applicable
  useEffect(() => {
    if (
      auction &&
      auction.auctionType === AuctionType.DUTCH &&
      auction.active
    ) {
      const updateDutchPrice = async () => {
        if (!signer) return;
        try {
          const contract = getContract(signer);
          const dutchPrice = await contract.getDutchCurrentPrice(auctionId);
          setCurrentDutchPrice(dutchPrice);
        } catch (error) {
          console.error('[AuctionPage ERROR]: Failed to update Dutch price', {
            auctionId,
            error,
          });
        }
      };

      updateDutchPrice();
      const timer = setInterval(updateDutchPrice, 5000);
      return () => clearInterval(timer);
    }
  }, [auction, signer, auctionId]);

  if (loading) {
    return (
      <div className="container flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Auction Not Found</CardTitle>
            <CardDescription>
              The auction you are looking for does not exist or has been
              removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{auction.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={auction.active ? 'default' : 'secondary'}>
            {auction.active ? 'Active' : 'Ended'}
          </Badge>
          <Badge variant="outline">
            {getAuctionTypeString(auction.auctionType)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main auction info */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Auction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Seller
                  </h3>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {auction.seller.substring(0, 6)}...
                    {auction.seller.substring(auction.seller.length - 4)}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Time Left
                  </h3>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {timeLeft}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Starting Price
                  </h3>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {ethers.formatEther(auction.startPrice)} ETH
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Current Price
                  </h3>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {auction.auctionType === AuctionType.DUTCH &&
                    currentDutchPrice
                      ? ethers.formatEther(currentDutchPrice)
                      : ethers.formatEther(auction.currentPrice)}{' '}
                    ETH
                  </p>
                </div>
              </div>

              {auction.auctionType === AuctionType.ENGLISH && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Minimum Bid Increment
                  </h3>
                  <p>{ethers.formatEther(auction.minBidIncrement)} ETH</p>
                </div>
              )}

              {auction.maxPrice > BigInt(0) && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Maximum Price
                  </h3>
                  <p>{ethers.formatEther(auction.maxPrice)} ETH</p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Number of Winners
                </h3>
                <p>{auction.numWinners.toString()}</p>
              </div>

              {auction.isRWA && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    RWA Token URI
                  </h3>
                  <p className="truncate">{auction.rwaTokenURI}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bid section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {isOwner ? 'Auction Management' : 'Place a Bid'}
              </CardTitle>
              <CardDescription>
                {isOwner ? 'Manage your auction' : 'Enter your bid amount'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={auction.active ? 'default' : 'secondary'}>
                      {auction.active ? 'Active' : 'Ended'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Can close early:</span>
                    {auction.canCloseEarly ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {auction.active && (
                    <Button
                      onClick={endAuction}
                      variant="destructive"
                      className="w-full"
                      disabled={!auction.canCloseEarly && timeLeft !== 'Ended'}
                    >
                      End Auction
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!auction.active ? (
                    <div className="p-4 text-center">
                      <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                      <p>This auction has ended</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bidAmount">Bid Amount (ETH)</Label>
                        <Input
                          id="bidAmount"
                          type="number"
                          step="0.01"
                          min={
                            auction.auctionType === AuctionType.DUTCH &&
                            currentDutchPrice
                              ? parseFloat(
                                  ethers.formatEther(currentDutchPrice)
                                )
                              : parseFloat(
                                  ethers.formatEther(auction.currentPrice)
                                ) +
                                parseFloat(
                                  ethers.formatEther(auction.minBidIncrement)
                                )
                          }
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter amount in ETH"
                        />
                        <p className="text-xs text-muted-foreground">
                          {auction.auctionType === AuctionType.ENGLISH && (
                            <>
                              Minimum bid:{' '}
                              {ethers.formatEther(
                                auction.currentPrice + auction.minBidIncrement
                              )}{' '}
                              ETH
                            </>
                          )}
                          {auction.auctionType === AuctionType.DUTCH &&
                            currentDutchPrice && (
                              <>
                                Current price:{' '}
                                {ethers.formatEther(currentDutchPrice)} ETH
                              </>
                            )}
                        </p>
                      </div>

                      <Button
                        onClick={placeBid}
                        className="w-full"
                        disabled={!bidAmount || parseFloat(bidAmount) <= 0}
                      >
                        Place Bid
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
