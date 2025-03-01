import { ethers } from 'ethers';

// Enum для типів аукціонів (має відповідати контракту)
enum AuctionType {
  ENGLISH,
  DUTCH,
  SEALED_BID,
  TIME_BASED,
  CHARITY,
}

// Інтерфейс для аукціону
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

// Мок-дані для аукціонів з правильною типізацією
const mockAuctions: Record<string, AuctionData> = {
  '1': {
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Rare NFT Collection',
    auctionType: AuctionType.ENGLISH,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    startPrice: ethers.parseEther('0.5'),
    currentPrice: ethers.parseEther('0.7'),
    minBidIncrement: ethers.parseEther('0.1'),
    maxPrice: ethers.parseEther('2.0'),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
    active: true,
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenId: BigInt(0),
    rewardAmount: BigInt(0),
    isERC721: true,
    isERC1155: false,
    numWinners: BigInt(1),
    canCloseEarly: true,
    isRWA: false,
    rwaTokenURI: '',
    dutchPriceDecrement: BigInt(0),
    sealedBidRevealTime: BigInt(0),
  },
  '2': {
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    name: 'Gaming Token Bundle',
    auctionType: AuctionType.DUTCH,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    startPrice: ethers.parseEther('1.0'),
    currentPrice: ethers.parseEther('0.8'),
    minBidIncrement: ethers.parseEther('0.05'),
    maxPrice: ethers.parseEther('0'),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 43200), // 12 hours from now
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 7200), // 2 hours ago
    active: true,
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenId: BigInt(0),
    rewardAmount: BigInt(0),
    isERC721: false,
    isERC1155: true,
    numWinners: BigInt(5),
    canCloseEarly: false,
    isRWA: false,
    rwaTokenURI: '',
    dutchPriceDecrement: ethers.parseEther('0.1'),
    sealedBidRevealTime: BigInt(0),
  },
  '3': {
    seller: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    name: 'Metaverse Land Parcel',
    auctionType: AuctionType.SEALED_BID,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    startPrice: ethers.parseEther('2.0'),
    currentPrice: ethers.parseEther('2.0'),
    minBidIncrement: ethers.parseEther('0.2'),
    maxPrice: ethers.parseEther('5.0'),
    endTime: BigInt(Math.floor(Date.now() / 1000) + 172800), // 48 hours from now
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 10800), // 3 hours ago
    active: true,
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenId: BigInt(0),
    rewardAmount: BigInt(0),
    isERC721: true,
    isERC1155: false,
    numWinners: BigInt(1),
    canCloseEarly: false,
    isRWA: true,
    rwaTokenURI: 'https://example.com/metaverse-land/123',
    dutchPriceDecrement: BigInt(0),
    sealedBidRevealTime: BigInt(Math.floor(Date.now() / 1000) + 86400), // 24 hours from now
  },
  '4': {
    seller: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    name: 'DeFi Governance Token',
    auctionType: AuctionType.ENGLISH,
    tokenAddress: '0x0000000000000000000000000000000000000000',
    startPrice: ethers.parseEther('1.5'),
    currentPrice: ethers.parseEther('3.2'),
    minBidIncrement: ethers.parseEther('0.1'),
    maxPrice: ethers.parseEther('5.0'),
    endTime: BigInt(Math.floor(Date.now() / 1000) - 86400), // Ended 24 hours ago
    createdAt: BigInt(Math.floor(Date.now() / 1000) - 259200), // Created 3 days ago
    active: false,
    rewardToken: '0x0000000000000000000000000000000000000000',
    rewardTokenId: BigInt(0),
    rewardAmount: BigInt(0),
    isERC721: false,
    isERC1155: false,
    numWinners: BigInt(1),
    canCloseEarly: true,
    isRWA: false,
    rwaTokenURI: '',
    dutchPriceDecrement: BigInt(0),
    sealedBidRevealTime: BigInt(0),
  },
};

// Мок-функція для отримання поточної ціни для голландського аукціону
function getDutchCurrentPrice(auctionId: string) {
  const auction = mockAuctions[auctionId];
  if (auction.auctionType !== AuctionType.DUTCH) {
    return auction.currentPrice;
  }

  const elapsedTime = BigInt(Math.floor(Date.now() / 1000)) - auction.createdAt;
  const totalAuctionTime = auction.endTime - auction.createdAt;

  // Переконуємося, що всі операції виконуються з bigint
  const decrement =
    (auction.dutchPriceDecrement * elapsedTime) / totalAuctionTime;

  const currentPrice = auction.startPrice - decrement;
  return currentPrice > BigInt(0) ? currentPrice : BigInt(1); // Мінімальна ціна 1 wei
}

// Інтерфейс для мок-контракту
interface MockContract {
  auctions: (auctionId: string) => Promise<AuctionData>;
  getDutchCurrentPrice: (auctionId: string) => Promise<bigint>;
  placeBid: (
    auctionId: string,
    sealedBid: string,
    options: { value: bigint }
  ) => Promise<{
    wait: () => Promise<{ status: number }>;
  }>;
  endAuction: (auctionId: string) => Promise<{
    wait: () => Promise<{ status: number }>;
  }>;
  // Додаємо нові методи для підтримки projects.ts
  filters: {
    ProjectCreated: (projectId: any, creator: string) => any;
    SubmissionCreated: (projectId: any, submitter: any) => any;
  };
  queryFilter: (filter: any) => Promise<any[]>;
  interface: {
    parseLog: (log: any) => any;
  };
  projects: (id?: number) => Promise<any>;
}

// Створюємо мок-контракт
export function getMockContract(): MockContract {
  return {
    // Отримання даних аукціону
    auctions: async (auctionId: string) => {
      // Імітуємо затримку мережі
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!mockAuctions[auctionId]) {
        throw new Error(`Auction with ID ${auctionId} not found`);
      }

      return mockAuctions[auctionId];
    },

    // Отримання поточної ціни для голландського аукціону
    getDutchCurrentPrice: async (auctionId: string) => {
      // Імітуємо затримку мережі
      await new Promise((resolve) => setTimeout(resolve, 300));

      return getDutchCurrentPrice(auctionId);
    },

    // Розміщення ставки
    placeBid: async (
      auctionId: string,
      sealedBid: string,
      options: { value: bigint }
    ) => {
      // Імітуємо затримку мережі
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const auction = mockAuctions[auctionId];
      if (!auction) {
        throw new Error(`Auction with ID ${auctionId} not found`);
      }

      if (!auction.active) {
        throw new Error('Auction is not active');
      }

      if (auction.endTime < BigInt(Math.floor(Date.now() / 1000))) {
        throw new Error('Auction has ended');
      }

      // Перевірка мінімальної ставки для англійського аукціону
      if (auction.auctionType === AuctionType.ENGLISH) {
        if (options.value < auction.currentPrice + auction.minBidIncrement) {
          throw new Error('Bid amount is too low');
        }

        // Оновлюємо поточну ціну
        mockAuctions[auctionId].currentPrice = options.value;
      }

      // Повертаємо об'єкт транзакції
      return {
        wait: async () => {
          // Імітуємо затримку підтвердження транзакції
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return { status: 1 };
        },
      };
    },

    // Завершення аукціону
    endAuction: async (auctionId: string) => {
      // Імітуємо затримку мережі
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const auction = mockAuctions[auctionId];
      if (!auction) {
        throw new Error(`Auction with ID ${auctionId} not found`);
      }

      if (!auction.active) {
        throw new Error('Auction is already ended');
      }

      if (
        auction.endTime > BigInt(Math.floor(Date.now() / 1000)) &&
        !auction.canCloseEarly
      ) {
        throw new Error('Cannot end auction before end time');
      }

      // Завершуємо аукціон
      mockAuctions[auctionId].active = false;

      // Повертаємо об'єкт транзакції
      return {
        wait: async () => {
          // Імітуємо затримку підтвердження транзакції
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return { status: 1 };
        },
      };
    },

    // Мок для методу filters
    filters: {
      ProjectCreated: (projectId, creator) => {
        return { projectId, creator };
      },
      SubmissionCreated: (projectId, submitter) => {
        return { projectId, submitter };
      },
    },

    // Мок для методу queryFilter
    queryFilter: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return []; // Повертаємо порожній масив логів
    },

    // Мок для інтерфейсу
    interface: {
      parseLog: () => {
        return {
          args: {
            projectId: {
              toNumber: () => 0,
            },
          },
        };
      },
    },

    // Мок для методу projects
    projects: async (id) => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Якщо id не передано, повертаємо кількість проектів
      if (id === undefined) {
        return BigInt(0); // Немає проектів
      }

      // Інакше повертаємо дані проекту
      return {
        creator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Адреса користувача
        title: 'Mock Project',
        description: 'This is a mock project',
        submissionCount: 0,
      };
    },
  };
}
