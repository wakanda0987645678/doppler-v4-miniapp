import { Button } from "@/components/ui/button"
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { Link } from "react-router-dom"
import { ThemeToggle } from "../theme-toggle"

export function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address: address,
  })

  const truncateAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-3 px-4 mx-auto">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 dark:from-primary dark:via-primary/80 dark:to-primary/60 bg-clip-text text-transparent">
                Doppler Pools
              </span>
            </Link>
            <div className="flex gap-4">
              <Link to="/launch">
                <Button variant="ghost" size="sm" className="text-foreground dark:text-foreground hover:text-foreground/90 dark:hover:text-foreground/90">Launch Token</Button>
              </Link>
              <Link to="/create">
                <Button variant="ghost" size="sm" className="text-foreground dark:text-foreground hover:text-foreground/90 dark:hover:text-foreground/90">Create Pool</Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {isConnected && address ? (
              <div className="flex items-center gap-4">
                <div className="flex h-9 items-center justify-center rounded-md border bg-muted/50 px-4 text-sm">
                  <span className="text-foreground dark:text-foreground">
                    {balance?.formatted ? Number(balance.formatted).toFixed(4) : '0.0000'} ETH
                  </span>
                </div>
                <div className="flex h-9 items-center justify-center rounded-md border bg-muted/50 px-4 text-sm text-foreground dark:text-foreground">
                  {truncateAddress(address)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => disconnect()}
                  className="h-9 text-foreground dark:text-foreground"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => connect({ connector: injected() })}
                variant="outline"
                className="relative overflow-hidden group text-foreground dark:text-foreground"
              >
                <span className="relative z-10">Connect Wallet</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}