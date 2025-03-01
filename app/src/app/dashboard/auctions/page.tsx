'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag, Clock, ArrowUpRight } from 'lucide-react';

// Mock data for auctions
const mockAuctions = [
  {
    id: 1,
    title: 'Rare NFT Collection',
    description: 'Limited edition digital art collection',
    currentBid: '0.5 ETH',
    timeLeft: '2 days',
    bids: 12,
    status: 'active',
  },
  {
    id: 2,
    title: 'Gaming Token Bundle',
    description: 'Bundle of premium in-game tokens',
    currentBid: '0.2 ETH',
    timeLeft: '5 hours',
    bids: 8,
    status: 'active',
  },
  {
    id: 3,
    title: 'DeFi Governance Token',
    description: 'Voting rights for upcoming protocol',
    currentBid: '1.2 ETH',
    timeLeft: '1 day',
    bids: 24,
    status: 'active',
  },
  {
    id: 4,
    title: 'Metaverse Land Parcel',
    description: 'Prime location in popular metaverse',
    currentBid: '3.5 ETH',
    timeLeft: 'Ended',
    bids: 32,
    status: 'ended',
  },
];

export default function AuctionsPage() {
  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auctions</h1>
          <p className="text-muted-foreground">
            Browse and bid on digital assets
          </p>
        </div>
        <Button>
          Create Auction
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="active" className="mb-6">
        <TabsList>
          <TabsTrigger value="active">Active Auctions</TabsTrigger>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockAuctions
              .filter((auction) => auction.status === 'active')
              .map((auction) => (
                <Card key={auction.id}>
                  <CardHeader>
                    <CardTitle>{auction.title}</CardTitle>
                    <CardDescription>{auction.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Current Bid
                        </p>
                        <p className="text-lg font-bold">
                          {auction.currentBid}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Time Left
                        </p>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-bold">
                            {auction.timeLeft}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {auction.bids} bids
                    </Badge>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Place Bid</Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockAuctions
              .filter((auction) => auction.status === 'ended')
              .map((auction) => (
                <Card key={auction.id}>
                  <CardHeader>
                    <CardTitle>{auction.title}</CardTitle>
                    <CardDescription>{auction.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Final Bid
                        </p>
                        <p className="text-lg font-bold">
                          {auction.currentBid}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="secondary">Ended</Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {auction.bids} total bids
                    </Badge>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Daily Rewards</h2>
        <Card>
          <CardHeader>
            <CardTitle>Grab Daily Tokens</CardTitle>
            <CardDescription>
              Take your reward immediately with synthetic tokens after each task
              completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Grab Daily Tokens</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
