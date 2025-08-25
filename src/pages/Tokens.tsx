import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Token } from "@/utils/graphql";
import { formatEther } from "viem";
import { useTokens } from "@/hooks/useTokens";



function TokenCard({ token }: { token: Token }) {
  const formatNumber = (value: bigint) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(formatEther(value)))
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always',
    }).format(value / 100);
  }

  // Format timestamp to date

  return (
    <Card className="p-6 hover:border-primary/40 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {token.symbol}
          </h2>
          <p className="text-muted-foreground mt-1">{token.name}</p>
        </div>
        <Link to={`/token/${token.address}`}>
          <Button variant="outline" size="sm">View Token</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-1">
          <p className="text-lg font-medium">{formatNumber(token.currentPrice || 0n)}</p>
          <p className="text-xs text-muted-foreground">Price</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium">{formatNumber(token.volumeUsd || 0n)}</p>
          <p className="text-xs text-muted-foreground">Volume</p>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-medium">{formatEther(token.totalSupply || 0n)}</p>
          <p className="text-xs text-muted-foreground">Total Supply</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Updated {new Date(Number(token.createdAt) * 1000).toLocaleDateString()}
      </div>
    </Card>
  )
}

export default function Tokens() {
  const { data: tokens, isLoading, error } = useTokens();

  if (isLoading) {
    return <div className="p-8">Loading tokens...</div>;
  }

  if (error) {
    return <div className="p-8">Error loading tokens: {String(error)}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Tokens</h1>
        <Link to="/launch">
          <Button>Launch New Token</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens?.map((token: Token) => (
          <TokenCard key={token.address} token={token} />
        ))}
      </div>
    </div>
  );
}
