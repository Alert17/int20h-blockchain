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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ethers } from 'ethers';
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Flag,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../../../hooks/useEthersSigner';
import { getContract } from '../../../lib/contract';
import { getProjectsDetails } from '../../../lib/projects';

// Enum for auction types from the contract
enum AuctionType {
  ENGLISH,
  DUTCH,
  SEALED_BID,
  TIME_BASED,
  CHARITY,
}

export default function HomePage() {
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [allAuctions, setAllAuctions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  // Function to copy auction link to clipboard
  const copyAuctionLink = (id: string) => {
    const baseUrl = window.location.origin;
    const auctionUrl = `${baseUrl}/dashboard/auctions/${id}`;

    navigator.clipboard
      .writeText(auctionUrl)
      .then(() => {
        setCopiedId(id);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  useEffect(() => {
    async function fetchMyAuctions() {
      try {
        setLoading(true);

        // Get detailed information about user projects
        const projects = await getProjectsDetails(signer!, address);
        console.log('[HomePage INFO]: Fetched projects', {
          address,
          projectsCount: projects.length,
        });

        // Add mock auctions to my auctions
        if (signer) {
          const contract = getContract(signer);
          const myAuctionsData = [];

          // For mock purposes, we'll fetch auctions with IDs 1 and 2 as user's auctions
          const myAuctionIds = ['1', '2'];

          for (const id of myAuctionIds) {
            try {
              const auctionData = await contract.auctions(id);
              myAuctionsData.push({
                id,
                title: auctionData.name,
                description: `${getAuctionTypeString(auctionData.auctionType)} auction for your collection`,
                currentBid: ethers.formatEther(auctionData.currentPrice),
                timeLeft: calculateTimeLeft(auctionData.endTime),
                submissionCount: Number(auctionData.numWinners),
                auctionType: auctionData.auctionType,
                active: auctionData.active,
              });
            } catch (error) {
              console.error(`[HomePage ERROR]: Failed to fetch auction ${id}`, {
                error,
              });
            }
          }

          setMyAuctions([...projects, ...myAuctionsData]);
        } else {
          setMyAuctions(projects);
        }
      } catch (error) {
        console.error('[HomePage ERROR]: Failed to fetch projects', {
          address,
          error,
        });
      } finally {
        setLoading(false);
      }
    }

    async function fetchAllAuctions() {
      if (!signer) return;

      try {
        setLoading(true);
        const contract = getContract(signer);

        // For mock purposes, we'll fetch auctions with IDs 1, 2, 3, and 4
        const auctionIds = ['1', '2', '3', '4'];
        const auctionsData: Record<string, any> = {};

        for (const id of auctionIds) {
          try {
            const auctionData = await contract.auctions(id);
            auctionsData[id] = {
              ...auctionData,
              id,
              timeLeft: calculateTimeLeft(auctionData.endTime),
            };
          } catch (error) {
            console.error(`[HomePage ERROR]: Failed to fetch auction ${id}`, {
              error,
            });
          }
        }

        setAllAuctions(auctionsData);
        console.log('[HomePage INFO]: Fetched all auctions', {
          count: Object.keys(auctionsData).length,
        });
      } catch (error) {
        console.error('[HomePage ERROR]: Failed to fetch auctions', {
          error,
        });
      } finally {
        setLoading(false);
      }
    }

    // Helper function to calculate time left
    function calculateTimeLeft(endTime: bigint): string {
      const endTimeMs = Number(endTime) * 1000;
      const now = Date.now();
      const diff = endTimeMs - now;

      if (diff <= 0) return 'Ended';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    }

    if (signer && address) {
      fetchMyAuctions();
      fetchAllAuctions();
    }
  }, [signer, address]);

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your auctions and bids</p>
        </div>
        <Link href="/dashboard/create-auction">
          <Button>
            Create Auction
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">My Auctions</h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : myAuctions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>My Auction Listings</CardTitle>
              <CardDescription>
                Manage and share your auctions with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAuctions.map((auction, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between rounded-lg border p-4 md:flex-row md:items-center"
                  >
                    <div className="mb-3 flex items-start gap-3 md:mb-0 md:items-center">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {auction.title || `Auction #${auction.id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {auction.description || 'No description available'}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {auction.auctionType !== undefined && (
                            <Badge variant="outline">
                              {getAuctionTypeString(auction.auctionType)}
                            </Badge>
                          )}
                          {auction.active !== undefined && (
                            <Badge
                              variant={auction.active ? 'default' : 'secondary'}
                            >
                              {auction.active ? 'Active' : 'Ended'}
                            </Badge>
                          )}
                          {auction.timeLeft && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {auction.timeLeft}
                            </div>
                          )}
                          {(auction.currentBid || auction.currentBid === 0) && (
                            <div className="flex items-center text-sm">
                              <DollarSign className="mr-1 h-3 w-3" />
                              {auction.currentBid} ETH
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
                      <div className="hidden w-full md:w-auto lg:block">
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {typeof window !== 'undefined'
                            ? `${window.location.origin}/dashboard/auctions/${auction.id}`
                            : `/dashboard/auctions/${auction.id}`}
                        </code>
                      </div>
                      <div className="flex w-full items-center gap-2 md:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full md:w-auto"
                          onClick={() => copyAuctionLink(auction.id)}
                        >
                          {copiedId === auction.id ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </>
                          )}
                        </Button>
                        <Link
                          href={`/dashboard/auctions/${auction.id}`}
                          className="w-full md:w-auto"
                        >
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">You have no auctions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t created any auctions yet. Create your first
              auction to get started.
            </p>
            <Link href="/dashboard/create-auction">
              <Button className="mt-4">Create Auction</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">All Available Auctions</h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : Object.keys(allAuctions).length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Auction Listings</CardTitle>
              <CardDescription>
                Browse all available auctions and share them with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Time Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(allAuctions).map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium">
                        {auction.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getAuctionTypeString(auction.auctionType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {ethers.formatEther(auction.currentPrice)} ETH
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          {auction.timeLeft}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={auction.active ? 'default' : 'secondary'}
                        >
                          {auction.active ? 'Active' : 'Ended'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => copyAuctionLink(auction.id)}
                                >
                                  {copiedId === auction.id ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy auction link</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Link href={`/dashboard/auctions/${auction.id}`}>
                            <Button variant="default" size="sm">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No auctions available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no auctions available at the moment. Check back later or
              create your own.
            </p>
            <Link href="/dashboard/create-auction">
              <Button className="mt-4">Create Auction</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
