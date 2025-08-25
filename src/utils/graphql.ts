import { GraphQLClient } from "graphql-request";
import { Address } from "viem";

// Initialize GraphQL client
export const client = new GraphQLClient("https://doppler-dev-g283.marble.live/");
// const client = new GraphQLClient("http://localhost:42069/");

// Token type definition
export interface Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  createdAt: bigint;
  launchPrice: bigint;
  currentPrice: bigint;
  marketCap: bigint;
  volume24h: bigint;
}

export interface Asset {
  marketCapUsd: bigint;
}

export interface DailyVolume {
  volumeUsd: bigint;
}

// Pool type definition based on schema
export interface Pool {
  address: string;
  chainId: bigint;
  tick: number;
  sqrtPrice: bigint;
  liquidity: bigint;
  createdAt: bigint;
  asset: Asset;
  baseToken: Token;
  quoteToken: Token;
  price: bigint;
  fee: number;
  type: string;
  dollarLiquidity: bigint;
  dailyVolume: DailyVolume;
  volumeUsd: bigint;
  percentDayChange: number;
  totalFee0: bigint;
  totalFee1: bigint;
  graduationBalance: bigint;
  isToken0: boolean;
  lastRefreshed: bigint | null;
  lastSwapTimestamp: bigint | null;
  reserves0: bigint;
  reserves1: bigint;
  marketCapUsd?: bigint;
}

export interface Pools {
  items: Pool[];
}

export interface TokensResponse {
  tokens: {
    items: Token[];
  }
}

// Function to fetch all tokens from pools
export const getTokens = async () => {
  try {
    // Get all pools first
    const poolsResponse = await client.request<{ pools: Pools }>(GET_POOLS_QUERY);
    const pools = poolsResponse.pools.items;

    // Extract unique tokens from pools
    const tokenMap = new Map<string, Token>();
    
    pools.forEach(pool => {
      // Add base token if not already in map
      if (!tokenMap.has(pool.baseToken.address)) {
        tokenMap.set(pool.baseToken.address, {
          ...pool.baseToken,
          totalSupply: pool.reserves0,
          volumeUsd: pool.dailyVolume.volumeUsd,
          // Initialize other fields to make TypeScript happy
          createdAt: pool.createdAt,
          launchPrice: 0n,
          currentPrice: pool.price,
          marketCap: pool.asset.marketCapUsd || 0n,
          volume24h: pool.dailyVolume.volumeUsd
        });
      }

      // Add quote token if not already in map
      if (!tokenMap.has(pool.quoteToken.address)) {
        tokenMap.set(pool.quoteToken.address, {
          ...pool.quoteToken,
          totalSupply: pool.reserves1,
          volumeUsd: pool.dailyVolume.volumeUsd,
          // Initialize other fields
          createdAt: pool.createdAt,
          launchPrice: 0n,
          currentPrice: pool.price,
          marketCap: pool.asset.marketCapUsd || 0n,
          volume24h: pool.dailyVolume.volumeUsd
        });
      }
    });

    console.log('Tokens extracted from pools:', Array.from(tokenMap.values())); // For debugging
    return Array.from(tokenMap.values());
  } catch (error) {
    console.error('Failed to fetch tokens from pools:', error);
    throw error;
  }
};

// GraphQL query for fetching all tokens
export const GET_TOKENS_QUERY = `
  query GetTokens {
    tokens(orderBy: "address", orderDirection: "desc") {
      items {
        address
        name
        symbol
        totalSupply
        volumeUsd
      }
    }
  }
`

// GraphQL query for fetching pools
export const GET_POOLS_QUERY = `
  query GetPools {
    pools(orderBy: "createdAt", orderDirection: "desc", where: { type: "v4" }) {
      items {
        address
        chainId
        tick
        sqrtPrice
        liquidity
        createdAt
        baseToken {
          address
          name
          symbol
        }
        quoteToken {
          address
          name
          symbol
        }
        price
        fee
        type
        dollarLiquidity
        dailyVolume {
          volumeUsd
        }
        asset {
          marketCapUsd
        }
        volumeUsd
        percentDayChange
        totalFee0
        totalFee1
        graduationBalance
        isToken0
        lastRefreshed
        lastSwapTimestamp
        reserves0
        reserves1
      }
    }
  }
`;

export const GET_TOKEN_QUERY = `
  query GetTokenDetails($address: String!, $chainId: BigInt!) {
    pools(where: { 
      or: [
        { baseToken_: { address: $address } },
        { quoteToken_: { address: $address } }
      ],
      chainId: $chainId
    }) {
      items {
        address
        chainId
        tick
        sqrtPrice
        liquidity
        createdAt
        baseToken {
          address
          name
          symbol
        }
        quoteToken {
          address
          name
          symbol
        }
        price
        fee
        dollarLiquidity
        dailyVolume {
          volumeUsd
        }
        asset {
          marketCapUsd
        }
        volumeUsd
        percentDayChange
        totalFee0
        totalFee1
        reserves0
        reserves1
      }
    }
  }
`;

export const GET_POOL_QUERY = `
  query GetPool($address: String!, $chainId: BigInt!) {
    pool(address: $address, chainId: $chainId) {
      address
      chainId
      tick
      sqrtPrice
      liquidity
      createdAt
      asset {
        marketCapUsd
      }
      baseToken {
        address
        name
        symbol
      }
      quoteToken {
        address
        name
        symbol
      }
      price
      fee
      type
      dollarLiquidity
      dailyVolume {
        volumeUsd
      }
      volumeUsd
      percentDayChange
      totalFee0
      totalFee1
      graduationBalance
      isToken0
      lastRefreshed
      lastSwapTimestamp
      reserves0
      reserves1
      marketCapUsd
    }
  }
`


// Function to fetch pools using TanStack Query
export const getPools = async (): Promise<Pools> => {
  const response = await client.request<{ pools: Pools }>(GET_POOLS_QUERY);
  return response.pools;
};

export const getPool = async (address: Address, chainId: number): Promise<Pool> => {
  const response = await client.request<{ pool: Pool }>(GET_POOL_QUERY, {
    address,
    chainId: BigInt(chainId).toString(),
  })
  return response.pool
}

export interface TokenDetails {
  address: string;
  name: string;
  symbol: string;
  totalSupply: bigint;
  price: bigint;
  marketCap: bigint;
  volume24h: bigint;
  totalLiquidity: bigint;
  pools: Pool[];
}

export const getTokenDetails = async (address: string, chainId: number = 84532): Promise<TokenDetails> => {
  const response = await client.request<{ pools: { items: Pool[] } }>(GET_TOKEN_QUERY, {
    address,
    chainId: BigInt(chainId).toString(),
  });

  const pools = response.pools.items;
  if (pools.length === 0) {
    throw new Error('Token not found');
  }

  // Find token info from the first pool
  const tokenInfo = pools[0].baseToken.address.toLowerCase() === address.toLowerCase() 
    ? pools[0].baseToken 
    : pools[0].quoteToken;

  // Calculate total liquidity and volume across all pools
  const totalLiquidity = pools.reduce((sum, pool) => sum + pool.dollarLiquidity, 0n);
  const totalVolume = pools.reduce((sum, pool) => sum + pool.dailyVolume.volumeUsd, 0n);
  
  // Get total supply from reserves
  const totalSupply = pools[0].baseToken.address.toLowerCase() === address.toLowerCase()
    ? pools[0].reserves0
    : pools[0].reserves1;

  return {
    address: tokenInfo.address,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    totalSupply,
    price: pools[0].price,
    marketCap: pools[0].asset.marketCapUsd || 0n,
    volume24h: totalVolume,
    totalLiquidity,
    pools
  };
}
