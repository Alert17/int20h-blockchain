'use client';

import { useState } from 'react';
import { useEthersSigner } from '../../../hooks/useEthersSigner';
import { getContract } from '../../../lib/contract';
import { ZeroAddress, parseEther } from 'ethers';
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
// import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Enum to match the contract's AuctionType
enum AuctionType {
  ENGLISH = 0,
  DUTCH = 1,
  SEALED_BID = 2,
  TIME_BASED = 3,
}

export default function CreateAuction() {
  const signer = useEthersSigner();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Basic auction details
  const [name, setName] = useState('');
  const [auctionType, setAuctionType] = useState<AuctionType>(
    AuctionType.ENGLISH
  );
  const [startPrice, setStartPrice] = useState('');
  const [minBidIncrement, setMinBidIncrement] = useState('0.01');
  const [maxPrice, setMaxPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [numWinners, setNumWinners] = useState('1');
  const [canCloseEarly, setCanCloseEarly] = useState(false);

  // Token details
  const [tokenAddress, setTokenAddress] = useState('');
  const [isERC721, setIsERC721] = useState(false);
  const [isERC1155, setIsERC1155] = useState(false);
  const [rewardToken, setRewardToken] = useState('');
  const [rewardTokenId, setRewardTokenId] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');

  // RWA details
  const [isRWA, setIsRWA] = useState(false);
  const [rwaTokenURI, setRwaTokenURI] = useState('');

  // Auction type specific details
  const [dutchPriceDecrement, setDutchPriceDecrement] = useState('');
  const [sealedBidRevealTime, setSealedBidRevealTime] = useState('');

  const calculateEndTimestamp = (dateTimeString: string) => {
    return Math.floor(new Date(dateTimeString).getTime() / 1000);
  };

  const calculateRevealTimestamp = (dateTimeString: string) => {
    return Math.floor(new Date(dateTimeString).getTime() / 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signer) {
      setError('Please connect your wallet.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const contract = getContract(signer);

      // Convert values to appropriate formats
      const endTimeTimestamp = calculateEndTimestamp(endTime);
      const revealTimeTimestamp = sealedBidRevealTime
        ? calculateRevealTimestamp(sealedBidRevealTime)
        : 0;

      // Prepare auction parameters
      const auctionParams = {
        name,
        auctionType,
        tokenAddress: tokenAddress || ZeroAddress,
        startPrice: parseEther(startPrice),
        minBidIncrement: parseEther(minBidIncrement),
        maxPrice: maxPrice ? parseEther(maxPrice) : 0,
        endTime: endTimeTimestamp,
        rewardToken: rewardToken || ZeroAddress,
        rewardTokenId: rewardTokenId || '0',
        rewardAmount: rewardAmount ? parseEther(rewardAmount) : 0,
        isERC721,
        isERC1155,
        numWinners: parseInt(numWinners),
        canCloseEarly,
        isRWA,
        rwaTokenURI,
        dutchPriceDecrement: dutchPriceDecrement
          ? parseEther(dutchPriceDecrement)
          : 0,
        sealedBidRevealTime: revealTimeTimestamp,
      };

      // Get the creation fee from the contract
      const creationFee = await contract.creationFee();

      // Call the createAuction function with the fee
      const tx = await contract.createAuction(auctionParams, {
        value: creationFee,
      });
      await tx.wait();

      setSuccess('Auction created successfully!');

      // Reset form after successful submission
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(
        'Transaction failed: ' + (err.message || err.reason || 'Unknown error')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAuctionType(AuctionType.ENGLISH);
    setStartPrice('');
    setMinBidIncrement('0.01');
    setMaxPrice('');
    setEndTime('');
    setNumWinners('1');
    setCanCloseEarly(false);
    setTokenAddress('');
    setIsERC721(false);
    setIsERC1155(false);
    setRewardToken('');
    setRewardTokenId('');
    setRewardAmount('');
    setIsRWA(false);
    setRwaTokenURI('');
    setDutchPriceDecrement('');
    setSealedBidRevealTime('');
  };

  // Calculate minimum date-time for end time (now + 1 hour)
  const minEndTime = new Date();
  minEndTime.setHours(minEndTime.getHours() + 1);
  const minEndTimeString = minEndTime.toISOString().slice(0, 16);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Auction</h1>
        <p className="text-muted-foreground">
          Set up a new auction for your digital or real-world assets
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Details</TabsTrigger>
            <TabsTrigger value="token">Token Details</TabsTrigger>
            <TabsTrigger value="auction-type">Auction Type</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Auction Details</CardTitle>
                <CardDescription>
                  Set the core parameters for your auction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Auction Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a descriptive name for your auction"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="startPrice">Starting Price (ETH)</Label>
                    <Input
                      id="startPrice"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={startPrice}
                      onChange={(e) => setStartPrice(e.target.value)}
                      placeholder="e.g. 0.1"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="minBidIncrement">
                      Minimum Bid Increment (ETH)
                    </Label>
                    <Input
                      id="minBidIncrement"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={minBidIncrement}
                      onChange={(e) => setMinBidIncrement(e.target.value)}
                      placeholder="e.g. 0.01"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      min={minEndTimeString}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The auction will automatically end at this time
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="numWinners">Number of Winners</Label>
                    <Input
                      id="numWinners"
                      type="number"
                      min="1"
                      value={numWinners}
                      onChange={(e) => setNumWinners(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      For multiple winners, the top N bids will win
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="token" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Token Details</CardTitle>
                <CardDescription>
                  Configure the token or asset being auctioned
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tokenAddress">
                      Token Address (optional)
                    </Label>
                    <Input
                      id="tokenAddress"
                      value={tokenAddress}
                      onChange={(e) => setTokenAddress(e.target.value)}
                      placeholder="0x..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for native ETH auction
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Token Type</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isERC721"
                          checked={isERC721}
                          onCheckedChange={(checked) => {
                            setIsERC721(checked);
                            if (checked) setIsERC1155(false);
                          }}
                        />
                        <Label htmlFor="isERC721">ERC-721 (NFT)</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isERC1155"
                          checked={isERC1155}
                          onCheckedChange={(checked) => {
                            setIsERC1155(checked);
                            if (checked) setIsERC721(false);
                          }}
                        />
                        <Label htmlFor="isERC1155">
                          ERC-1155 (Multi-token)
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Real World Asset (RWA)</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isRWA"
                        checked={isRWA}
                        onCheckedChange={setIsRWA}
                      />
                      <Label htmlFor="isRWA">This is a real-world asset</Label>
                    </div>

                    {isRWA && (
                      <div className="mt-2">
                        <Label htmlFor="rwaTokenURI">RWA Token URI</Label>
                        <Input
                          id="rwaTokenURI"
                          value={rwaTokenURI}
                          onChange={(e) => setRwaTokenURI(e.target.value)}
                          placeholder="ipfs://..."
                          required={isRWA}
                        />
                        <p className="text-xs text-muted-foreground">
                          URI to metadata describing the real-world asset
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Reward Details (optional)</Label>
                    <div className="grid gap-2">
                      <Label htmlFor="rewardToken">Reward Token Address</Label>
                      <Input
                        id="rewardToken"
                        value={rewardToken}
                        onChange={(e) => setRewardToken(e.target.value)}
                        placeholder="0x..."
                      />

                      <Label htmlFor="rewardTokenId">Reward Token ID</Label>
                      <Input
                        id="rewardTokenId"
                        value={rewardTokenId}
                        onChange={(e) => setRewardTokenId(e.target.value)}
                        placeholder="For ERC-721/ERC-1155 tokens"
                      />

                      <Label htmlFor="rewardAmount">Reward Amount</Label>
                      <Input
                        id="rewardAmount"
                        type="number"
                        step="0.001"
                        min="0"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(e.target.value)}
                        placeholder="Amount of tokens to reward"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auction-type" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Auction Type</CardTitle>
                <CardDescription>
                  Select the type of auction and its specific parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="auctionType">Auction Type</Label>
                    <Select
                      value={auctionType.toString()}
                      onValueChange={(value) => setAuctionType(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select auction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AuctionType.ENGLISH.toString()}>
                          English Auction
                        </SelectItem>
                        <SelectItem value={AuctionType.DUTCH.toString()}>
                          Dutch Auction
                        </SelectItem>
                        <SelectItem value={AuctionType.SEALED_BID.toString()}>
                          Sealed Bid Auction
                        </SelectItem>
                        <SelectItem value={AuctionType.TIME_BASED.toString()}>
                          Time-Based Auction
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {auctionType === AuctionType.ENGLISH && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>English Auction</AlertTitle>
                      <AlertDescription>
                        In an English auction, bidders place increasingly higher
                        bids until no one is willing to bid higher. The highest
                        bidder wins the auction.
                      </AlertDescription>
                    </Alert>
                  )}

                  {auctionType === AuctionType.DUTCH && (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Dutch Auction</AlertTitle>
                        <AlertDescription>
                          In a Dutch auction, the price starts high and
                          decreases over time until someone places a bid. The
                          first bidder wins the auction at the current price.
                        </AlertDescription>
                      </Alert>

                      <div className="grid gap-2">
                        <Label htmlFor="maxPrice">Maximum Price (ETH)</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          step="0.001"
                          min={startPrice}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="e.g. 1.0"
                          required={auctionType === AuctionType.DUTCH}
                        />
                        <p className="text-xs text-muted-foreground">
                          The starting (maximum) price for the Dutch auction
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="dutchPriceDecrement">
                          Price Decrement (ETH)
                        </Label>
                        <Input
                          id="dutchPriceDecrement"
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={dutchPriceDecrement}
                          onChange={(e) =>
                            setDutchPriceDecrement(e.target.value)
                          }
                          placeholder="e.g. 0.01"
                          required={auctionType === AuctionType.DUTCH}
                        />
                        <p className="text-xs text-muted-foreground">
                          The amount by which the price decreases over time
                        </p>
                      </div>
                    </>
                  )}

                  {auctionType === AuctionType.SEALED_BID && (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Sealed Bid Auction</AlertTitle>
                        <AlertDescription>
                          In a sealed bid auction, bidders submit encrypted bids
                          that are revealed after the bidding period. The
                          highest revealed bid wins the auction.
                        </AlertDescription>
                      </Alert>

                      <div className="grid gap-2">
                        <Label htmlFor="sealedBidRevealTime">Reveal Time</Label>
                        <Input
                          id="sealedBidRevealTime"
                          type="datetime-local"
                          min={minEndTimeString}
                          max={endTime}
                          value={sealedBidRevealTime}
                          onChange={(e) =>
                            setSealedBidRevealTime(e.target.value)
                          }
                          required={auctionType === AuctionType.SEALED_BID}
                        />
                        <p className="text-xs text-muted-foreground">
                          The time when sealed bids will be revealed (must be
                          before end time)
                        </p>
                      </div>
                    </>
                  )}

                  {auctionType === AuctionType.TIME_BASED && (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Time-Based Auction</AlertTitle>
                        <AlertDescription>
                          In a time-based auction, the highest bid at the end of
                          the auction period wins. This is similar to an English
                          auction but with a fixed end time.
                        </AlertDescription>
                      </Alert>

                      <div className="grid gap-2">
                        <Label htmlFor="duration">Auction Duration</Label>
                        <div className="flex gap-2">
                          <Input
                            id="durationDays"
                            type="number"
                            min="0"
                            placeholder="Days"
                            className="w-1/3"
                            onChange={(e) => {
                              const days = parseInt(e.target.value) || 0;
                              const date = new Date();
                              date.setDate(date.getDate() + days);
                              if (endTime) {
                                const currentDate = new Date(endTime);
                                currentDate.setDate(date.getDate());
                                setEndTime(
                                  currentDate.toISOString().slice(0, 16)
                                );
                              }
                            }}
                          />
                          <Input
                            id="durationHours"
                            type="number"
                            min="0"
                            max="23"
                            placeholder="Hours"
                            className="w-1/3"
                            onChange={(e) => {
                              const hours = parseInt(e.target.value) || 0;
                              const date = new Date();
                              date.setHours(date.getHours() + hours);
                              if (endTime) {
                                const currentDate = new Date(endTime);
                                currentDate.setHours(date.getHours());
                                setEndTime(
                                  currentDate.toISOString().slice(0, 16)
                                );
                              }
                            }}
                          />
                          <Input
                            id="durationMinutes"
                            type="number"
                            min="0"
                            max="59"
                            placeholder="Minutes"
                            className="w-1/3"
                            onChange={(e) => {
                              const minutes = parseInt(e.target.value) || 0;
                              const date = new Date();
                              date.setMinutes(date.getMinutes() + minutes);
                              if (endTime) {
                                const currentDate = new Date(endTime);
                                currentDate.setMinutes(date.getMinutes());
                                setEndTime(
                                  currentDate.toISOString().slice(0, 16)
                                );
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Set the duration for your auction
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Options</CardTitle>
                <CardDescription>
                  Configure additional auction settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="canCloseEarly"
                      checked={canCloseEarly}
                      onCheckedChange={setCanCloseEarly}
                    />
                    <Label htmlFor="canCloseEarly">Allow early closing</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If enabled, the auction creator can close the auction before
                    the end time
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50">
            <Info className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset Form
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Auction...' : 'Create Auction'}
          </Button>
        </div>
      </form>
    </div>
  );
}
