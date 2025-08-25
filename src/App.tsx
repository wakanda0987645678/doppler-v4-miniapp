import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { config } from './lib/wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AllPools from './pages/AllPools'
import CreatePool from './pages/CreatePool'
import PoolDetails from './pages/PoolDetails'
import TokenLaunch from './pages/TokenLaunch'
import Tokens from './pages/Tokens'
import TokenDetails from './pages/TokenDetails'
import { Navbar } from './components/ui/navbar'
import { Sidebar } from './components/ui/sidebar'
import { ThemeProvider } from './components/theme-provider'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="doppler-theme">
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <div className="min-h-screen bg-site-main font-sans antialiased">
              <div className="min-h-screen relative">
                <div className="dot-mask" />
                <Navbar />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 px-8">
                    <Routes>
                      <Route path="/" element={<Navigate to="/discovery" replace />} />
                      <Route path="/create" element={<CreatePool />} />
                      <Route path="/launch" element={<TokenLaunch />} />
                      <Route path="/pool/:chainId/:address" element={<PoolDetails />} />
                      <Route path="/discovery" element={<AllPools />} />
                      <Route path="/launch-channel" element={<div className="p-8"><h1 className="text-4xl font-bold">Launch Channel</h1></div>} />
                      <Route path="/tokens" element={<Tokens />} />
                      <Route path="/token/:address" element={<TokenDetails />} />
                      <Route path="/tokenize" element={<div className="p-8"><h1 className="text-4xl font-bold">Tokenize</h1></div>} />
                      <Route path="/create-pad" element={<div className="p-8"><h1 className="text-4xl font-bold">Create Pad</h1></div>} />
                      <Route path="/trending" element={<div className="p-8"><h1 className="text-4xl font-bold">Top Trending Channels</h1></div>} />
                      <Route path="/docs" element={<div className="p-8"><h1 className="text-4xl font-bold">Documentation</h1></div>} />
                      <Route path="/activities" element={<div className="p-8"><h1 className="text-4xl font-bold">Activities</h1></div>} />
                      <Route path="/faq" element={<div className="p-8"><h1 className="text-4xl font-bold">FAQ</h1></div>} />
                    </Routes>
                  </main>
                </div>
              </div>
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}

export default App
