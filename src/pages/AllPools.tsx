import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { usePools } from "@/hooks/usePools"
import { Pool } from "@/utils/graphql"
import { formatEther } from "viem"

function PoolCard({ pool }: { pool: Pool }) {
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
    }).format(value / 100)
  }

  return (
    <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {pool.baseToken.symbol}/{pool.quoteToken.symbol}
          </h2>
          <p className="text-muted-foreground mt-1">
            {pool.baseToken.name} / {pool.quoteToken.name}
          </p>
        </div>
        <Link to={`/pool/${pool.chainId}/${pool.address}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className="space-y-1">
          <p className="text-lg font-medium">{formatNumber(pool.dollarLiquidity)}</p>
          <p className="text-xs text-muted-foreground">Liquidity</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium">{formatNumber(BigInt(pool.dailyVolume.volumeUsd))}</p>
          <p className="text-xs text-muted-foreground">24h Volume</p>
        </div>
        
        <div className="space-y-1">
          <p className={`text-lg font-medium ${pool.percentDayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercent(pool.percentDayChange)}
          </p>
          <p className="text-xs text-muted-foreground">24h Change</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-lg font-medium">{formatNumber(BigInt(pool.asset.marketCapUsd))}</p>
          <p className="text-xs text-muted-foreground">Market Cap</p>
        </div>
      </div>
    </div>
  )
}

export default function AllPools() {
  const { data: pools, isLoading, error } = usePools()


  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Loading Pools...</h1>
        <div className="grid gap-6">
          <div className="border border-primary/20 rounded-lg p-6 bg-card/50 backdrop-blur animate-pulse">
            <div className="h-8 bg-primary/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-primary/20 rounded w-2/3 mb-6"></div>
            <div className="h-10 bg-primary/20 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Error Loading Pools</h1>
        <div className="text-red-500">{(error as Error).message}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary">Discovery</h1>
          <p className="text-muted-foreground mt-2">Explore active liquidity pools and trading opportunities</p>
        </div>
        <Link to="/create">
          <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40">
            Create New Pool
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <div className="border-b pb-4 mb-4">
          <h2 className="text-2xl font-semibold text-primary">Active Pools</h2>
          <p className="text-sm text-muted-foreground">Current active liquidity pools on the network</p>
        </div>
        
        {pools?.items?.map((pool) => (
          <PoolCard key={pool.address} pool={pool} />
        ))}
      </div>
    </div>
  )
}