'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, PieChart } from 'lucide-react';

export default function ChartsPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Auction Analytics</h1>
        <p className="text-muted-foreground">View statistics and trends for platform auctions</p>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="price-history">Price History</TabsTrigger>
          <TabsTrigger value="volume">Trading Volume</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Auctions
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
                <div className="mt-4 h-[200px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                  Chart placeholder
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Sale Price
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.82 ETH</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
                <div className="mt-4 h-[200px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                  Chart placeholder
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Volume
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,024 ETH</div>
                <p className="text-xs text-muted-foreground">
                  +35.6% from last month
                </p>
                <div className="mt-4 h-[200px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                  Chart placeholder
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Monthly Auction Activity</CardTitle>
              <CardDescription>
                Number of auctions and average price over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                Large chart placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="price-history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                Historical price trends for auctions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                Price history chart placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="volume" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
              <CardDescription>
                Total trading volume by time period and asset type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                Volume chart placeholder
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 