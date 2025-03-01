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
import { ArrowUpRight, Clock, Flag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../../../hooks/useEthersSigner';
import { getProjectsDetails } from '../../../lib/projects';

export default function HomePage() {
  const signer = useEthersSigner();
  const { address } = useAccount();
  const [myAuctions, setMyAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        // Get detailed information about user projects
        const projects = await getProjectsDetails(signer!, address);
        console.log('[HomePage INFO]: Fetched projects', {
          address,
          projectsCount: projects.length,
        });
        setMyAuctions(projects);
      } catch (error) {
        console.error('[HomePage ERROR]: Failed to fetch projects', {
          address,
          error,
        });
      } finally {
        setLoading(false);
      }
    }

    if (signer && address) {
      fetchProjects();
    }
  }, [signer, address]);

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your auctions and bids</p>
        </div>
        <Link href="/dashboard/create-project">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myAuctions.map((auction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>
                    {auction.title || `Auction #${auction.id}`}
                  </CardTitle>
                  <CardDescription>
                    {auction.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Bid
                      </p>
                      <p className="text-lg font-bold">
                        {auction.currentBid || '0'} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time Left</p>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-bold">
                          {auction.timeLeft || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {auction.submissionCount || 0} submissions
                  </Badge>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/dashboard/auctions/${auction.id}`}
                    className="w-full"
                  >
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border p-8 text-center">
            <Flag className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">You have no auctions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t created any auctions yet. Create your first
              auction to get started.
            </p>
            <Link href="/dashboard/create-project">
              <Button className="mt-4">Create Auction</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Daily Rewards</h2>
        <Card>
          <CardHeader>
            <CardTitle>Claim Daily Tokens</CardTitle>
            <CardDescription>
              Get your reward immediately with synthetic tokens after each task
              completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Claim Daily Tokens</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
