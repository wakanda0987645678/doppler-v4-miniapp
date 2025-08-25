import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { formatEther } from 'viem';
import { getTokenDetails } from '@/utils/graphql';

function formatUSD(value: bigint) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(formatEther(value)));
}

function formatNumber(value: bigint) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(formatEther(value)));
}

function TokenStats({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-medium">{value}</p>
      {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
  );
}

export default function TokenDetails() {
  const { address } = useParams<{ address: string }>();

  const { data: token, isLoading, error } = useQuery({
    queryKey: ['token', address],
    queryFn: () => getTokenDetails(address!),
    enabled: !!address,
    refetchInterval: 10000
  });

  if (isLoading) {
    return <div className="p-8">Loading token details...</div>;
  }

  if (error) {
    return <div className="p-8">Error loading token: {String(error)}</div>;
  }

  if (!token) {
    return <div className="p-8">Token not found</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Token Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {token.name} ({token.symbol})
          </h1>
          <p className="text-muted-foreground mt-2">
            Token Address: {token.address}
          </p>
        </div>

        {/* Overview Card */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <TokenStats 
              label="Price" 
              value={formatUSD(token.price)}
            />
            <TokenStats 
              label="Market Cap" 
              value={formatUSD(token.marketCap)}
            />
            <TokenStats 
              label="24h Volume" 
              value={formatUSD(token.volume24h)}
            />
            <TokenStats 
              label="Total Supply" 
              value={formatNumber(token.totalSupply)}
              subValue={`$${formatUSD(token.totalLiquidity)} locked`}
            />
          </div>
        </Card>

        {/* Pools Card */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Trading Pools</h2>
          <div className="space-y-4">
            {token.pools.map(pool => (
              <Card key={pool.address} className="p-4 hover:border-primary/40 transition-all">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {pool.baseToken.symbol}/{pool.quoteToken.symbol}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Fee: {(pool.fee / 100).toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatUSD(pool.dollarLiquidity)}</p>
                    <p className="text-sm text-muted-foreground">TVL</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatUSD(pool.dailyVolume.volumeUsd)}</p>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
