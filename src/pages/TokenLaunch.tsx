import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { getAddresses } from "@/utils/getAddresses"
import { getDrift } from "@/utils/drift"
import { getBlock } from "viem/actions"
import { tokenParams } from "@/utils/poolConfig"
import { ReadWriteFactory } from "doppler-v4-sdk"
import { encodeAbiParameters, parseUnits } from "viem"

export default function TokenLaunch() {
  const account = useAccount()
  const { data: walletClient } = useWalletClient()
  const [isLaunching, setIsLaunching] = useState(false)

  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    initialPrice: '',
    launchDate: '',
    description: '',
    website: '',
    socials: {
      twitter: '',
      telegram: '',
      discord: '',
    },
    vestingPeriod: '',
    teamAllocation: '',
    publicAllocation: '',
    // Pool configuration
    numTokensToSell: '',
    fee: '0.3',
    minProceeds: '',
    maxProceeds: '',
    epochLength: '200',
    tickSpacing: '8',
  })

  const handleLaunch = async (e: React.FormEvent) => {
    if (!walletClient) throw new Error("Wallet client not found")
    e.preventDefault()
    setIsLaunching(true)

    try {
      if (!account.address) throw new Error("Account address not found")

      const block = await getBlock(walletClient)
      const addresses = getAddresses(84532) // Base Sepolia testnet
      
      const drift = getDrift(walletClient)
      const deployParams = tokenParams({
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        timestamp: block.timestamp,
      })

      // Create factory instance
      const rwFactory = new ReadWriteFactory(addresses.airlock, drift)

      // Set up vesting and allocation parameters
      const vestingDuration = parseInt(formData.vestingPeriod) * 24 * 60 * 60 // Convert days to seconds
      const teamAllocationBps = Math.floor((parseFloat(formData.teamAllocation) / 100) * 10000) // Convert percentage to basis points
      const publicAllocationBps = Math.floor((parseFloat(formData.publicAllocation) / 100) * 10000)

      // Configure launch parameters
      const launchConfig = {
        initialPrice: parseUnits(formData.initialPrice, 18),
        vestingDuration: BigInt(vestingDuration),
        teamAllocation: BigInt(teamAllocationBps),
        publicAllocation: BigInt(publicAllocationBps),
      }

      // Create the pool with configured parameters
      const { createParams } = rwFactory.buildConfig({ ...deployParams, launchConfig }, addresses)
      await rwFactory.simulateCreate(createParams)
      await rwFactory.create(createParams)

      // Reset form after successful launch
      setFormData({
        tokenName: '',
        tokenSymbol: '',
        totalSupply: '',
        initialPrice: '',
        launchDate: '',
        description: '',
        website: '',
        socials: {
          twitter: '',
          telegram: '',
          discord: '',
        },
        vestingPeriod: '',
        teamAllocation: '',
        publicAllocation: '',
      })

    } catch (error) {
      console.error("Launch failed:", error)
    } finally {
      setIsLaunching(false)
    }
  }

  return (
    <div className="p-8 relative z-10">
      <div className="max-w-3xl mx-auto relative">
        <h1 className="text-4xl font-bold mb-8 text-primary relative z-10">Launch Your Token</h1>
        
        <div className="grid gap-8">
          <Card className="p-6 form-card">
            <h2 className="text-2xl font-semibold mb-6">Token Information</h2>
            <form onSubmit={handleLaunch} className="space-y-6 relative z-20">
              {/* Basic Token Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Name</label>
                  <Input
                    type="text"
                    value={formData.tokenName}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenName: e.target.value }))}
                    placeholder="e.g., My Awesome Token"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Token Symbol</label>
                  <Input
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase() }))}
                    placeholder="e.g., MAT"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Supply and Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Supply</label>
                  <Input
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: e.target.value }))}
                    placeholder="e.g., 1000000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Price (USD)</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialPrice: e.target.value }))}
                    placeholder="e.g., 0.001"
                    required
                  />
                </div>
              </div>

              {/* Launch Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Launch Date</label>
                <Input
                  type="datetime-local"
                  value={formData.launchDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, launchDate: e.target.value }))}
                  required
                />
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-md bg-background/50 border border-input focus:border-primary focus:ring-1 focus:ring-primary"
                  rows={4}
                  placeholder="Describe your project..."
                  required
                />
              </div>

              {/* Website and Socials */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Twitter</label>
                    <Input
                      type="text"
                      value={formData.socials.twitter}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socials: { ...prev.socials, twitter: e.target.value }
                      }))}
                      placeholder="@username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Telegram</label>
                    <Input
                      type="text"
                      value={formData.socials.telegram}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socials: { ...prev.socials, telegram: e.target.value }
                      }))}
                      placeholder="t.me/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discord</label>
                    <Input
                      type="text"
                      value={formData.socials.discord}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socials: { ...prev.socials, discord: e.target.value }
                      }))}
                      placeholder="discord.gg/..."
                    />
                  </div>
                </div>
              </div>

              {/* Tokenomics */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tokenomics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vesting Period (days)</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.vestingPeriod}
                      onChange={(e) => setFormData(prev => ({ ...prev, vestingPeriod: e.target.value }))}
                      placeholder="e.g., 365"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Team Allocation (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.teamAllocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamAllocation: e.target.value }))}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Public Allocation (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.publicAllocation}
                      onChange={(e) => setFormData(prev => ({ ...prev, publicAllocation: e.target.value }))}
                      placeholder="e.g., 80"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pool Configuration */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Pool Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tokens to Sell</label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.numTokensToSell}
                      onChange={(e) => setFormData(prev => ({ ...prev, numTokensToSell: e.target.value }))}
                      placeholder="Number of tokens for initial liquidity"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trading Fee (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                      placeholder="e.g., 0.3"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Proceeds (ETH)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.minProceeds}
                      onChange={(e) => setFormData(prev => ({ ...prev, minProceeds: e.target.value }))}
                      placeholder="Minimum ETH to raise"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Proceeds (ETH)</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.maxProceeds}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxProceeds: e.target.value }))}
                      placeholder="Maximum ETH to raise"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Epoch Length (blocks)</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.epochLength}
                      onChange={(e) => setFormData(prev => ({ ...prev, epochLength: e.target.value }))}
                      placeholder="e.g., 200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tick Spacing</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.tickSpacing}
                      onChange={(e) => setFormData(prev => ({ ...prev, tickSpacing: e.target.value }))}
                      placeholder="e.g., 8"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full bg-primary/90 hover:bg-primary/80"
                  disabled={isLaunching}
                >
                  {isLaunching ? 'Launching Token...' : 'Launch Token'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
