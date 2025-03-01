'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ethers } from 'ethers';
import { ArrowUpRight, Clock, DollarSign, Filter, Flag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useEthersSigner } from '../../../hooks/useEthersSigner';
import { getContract } from '../../../lib/contract';

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
}

export default function AuctionsPage() {
  const signer = useEthersSigner();
  const [auctions, setAuctions] = useState<
    Record<string, AuctionData & { id: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [timeLeftMap, setTimeLeftMap] = useState<Record<string, string>>({});
  const [selectedAuctionType, setSelectedAuctionType] =
    useState<AuctionType | null>(null);

  // Function to get auction type as string
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

  // Function to update time left for all auctions
  const updateTimeLeft = () => {
    const newTimeLeftMap: Record<string, string> = {};

    Object.entries(auctions).forEach(([id, auction]) => {
      const endTime = Number(auction.endTime) * 1000; // Convert to milliseconds
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        newTimeLeftMap[id] = 'Ended';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        newTimeLeftMap[id] = `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        newTimeLeftMap[id] = `${hours}h ${minutes}m`;
      } else {
        newTimeLeftMap[id] = `${minutes}m`;
      }
    });

    setTimeLeftMap(newTimeLeftMap);
  };

  // Function to fetch all auctions
  const fetchAuctions = async () => {
    if (!signer) return;

    try {
      setLoading(true);
      const contract = getContract(signer);

      // For mock purposes, we'll fetch auctions with IDs 1, 2, 3, and 4
      const auctionIds = ['1', '2', '3', '4'];
      const auctionsData: Record<string, AuctionData & { id: string }> = {};

      for (const id of auctionIds) {
        try {
          const auctionData = await contract.auctions(id);
          auctionsData[id] = { ...auctionData, id };
        } catch (error) {
          console.error(`[AuctionsPage ERROR]: Failed to fetch auction ${id}`, {
            error,
          });
        }
      }

      setAuctions(auctionsData);
      console.log('[AuctionsPage INFO]: Fetched auctions', {
        count: Object.keys(auctionsData).length,
      });
    } catch (error) {
      console.error('[AuctionsPage ERROR]: Failed to fetch auctions', {
        error,
      });
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (signer) {
      fetchAuctions();
    }
  }, [signer]);

  // Update time left every second
  useEffect(() => {
    if (Object.keys(auctions).length > 0) {
      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [auctions]);

  // Filter active auctions by type if a filter is selected
  const filteredActiveAuctions = Object.values(auctions)
    .filter((auction) => auction.active)
    .filter(
      (auction) =>
        selectedAuctionType === null ||
        auction.auctionType === selectedAuctionType
    );

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auctions</h1>
          <p className="text-muted-foreground">
            Browse and bid on digital assets
          </p>
        </div>
        <Link href="/dashboard/create-auction">
          <Button>
            Create Auction
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="mb-6">
        <TabsList>
          <TabsTrigger value="active">Active Auctions</TabsTrigger>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : Object.values(auctions).filter((auction) => auction.active)
              .length > 0 ? (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by type:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      selectedAuctionType === null ? 'default' : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedAuctionType(null)}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={
                      selectedAuctionType === AuctionType.ENGLISH
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedAuctionType(AuctionType.ENGLISH)}
                  >
                    English
                  </Badge>
                  <Badge
                    variant={
                      selectedAuctionType === AuctionType.DUTCH
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedAuctionType(AuctionType.DUTCH)}
                  >
                    Dutch
                  </Badge>
                  <Badge
                    variant={
                      selectedAuctionType === AuctionType.SEALED_BID
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedAuctionType(AuctionType.SEALED_BID)
                    }
                  >
                    Sealed Bid
                  </Badge>
                  <Badge
                    variant={
                      selectedAuctionType === AuctionType.TIME_BASED
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedAuctionType(AuctionType.TIME_BASED)
                    }
                  >
                    Time-Based
                  </Badge>
                  <Badge
                    variant={
                      selectedAuctionType === AuctionType.CHARITY
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => setSelectedAuctionType(AuctionType.CHARITY)}
                  >
                    Charity
                  </Badge>
                </div>
              </div>

              {filteredActiveAuctions.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredActiveAuctions.map((auction) => (
                    <Card key={auction.id}>
                      <CardHeader>
                        <CardTitle>{auction.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mr-2">
                            {getAuctionTypeString(auction.auctionType)}
                          </Badge>
                          {auction.isERC721 && 'NFT'}
                          {auction.isERC1155 && 'Multi-Token'}
                          {auction.isRWA && 'Real World Asset'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4 flex justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Current Price
                            </p>
                            <p className="flex items-center text-lg font-bold">
                              <DollarSign className="h-4 w-4" />
                              {ethers.formatEther(auction.currentPrice)} ETH
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Time Left
                            </p>
                            <div className="flex items-center">
                              <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                              <p className="text-lg font-bold">
                                {timeLeftMap[auction.id] || 'Calculating...'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="mb-2">
                          {auction.numWinners.toString()} winner
                          {Number(auction.numWinners) !== 1 ? 's' : ''}
                        </Badge>
                      </CardContent>
                      <CardFooter>
                        <Link
                          href={`/dashboard/auctions/${auction.id}`}
                          className="w-full"
                        >
                          <Button className="w-full">View Auction</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border p-8 text-center">
                  <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">
                    No Matching Auctions
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There are no active auctions matching your filter. Try
                    selecting a different auction type.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setSelectedAuctionType(null)}
                  >
                    Clear Filter
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border p-8 text-center">
              <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Active Auctions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no active auctions at the moment. Check back later or
                create your own.
              </p>
              <Link href="/dashboard/create-auction">
                <Button className="mt-4">Create Auction</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-bids" className="mt-4">
          <div className="rounded-lg border p-8 text-center">
            <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Active Bids</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t placed any bids yet. Browse active auctions to
              get started.
            </p>
            <Button className="mt-4" variant="outline">
              Browse Auctions
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ended" className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : Object.values(auctions).filter((auction) => !auction.active)
              .length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(auctions)
                .filter((auction) => !auction.active)
                .map((auction) => (
                  <Card key={auction.id}>
                    <CardHeader>
                      <CardTitle>{auction.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mr-2">
                          {getAuctionTypeString(auction.auctionType)}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 flex justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Final Price
                          </p>
                          <p className="flex items-center text-lg font-bold">
                            <DollarSign className="h-4 w-4" />
                            {ethers.formatEther(auction.currentPrice)} ETH
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <Badge variant="secondary">Ended</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link
                        href={`/dashboard/auctions/${auction.id}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="rounded-lg border p-8 text-center">
              <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Ended Auctions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are no ended auctions to display.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
