import { useFrame } from '@/components/farcaster-provider'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { monadTestnet } from 'viem/chains'
import { formatEther } from 'viem'
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { useState, useEffect } from 'react'


export function WalletActions() {
  const { isEthProviderAvailable } = useFrame()
  const { isConnected, address, connector } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { data: balance, isLoading } = useBalance({
    address,
    chainId: monadTestnet.id,
    // watch: true,
  })

  const shortenAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  // Fix hydration issue by only rendering after mount
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-connect Farcaster connector when available
  useEffect(() => {
    if (mounted && isEthProviderAvailable && !isConnected) {
      const farcasterConnector = connectors.find(
        (c) => c.id === 'farcasterMiniApp' || c.name === 'Farcaster Mini App'
      )
      if (farcasterConnector) {
        console.log('Auto-connecting Farcaster connector:', farcasterConnector)
        connect({ connector: farcasterConnector })
      }
    }
  }, [mounted, isEthProviderAvailable, isConnected, connectors, connect])

  // Debug logging
  console.log('WalletActions state:', { 
    isConnected, 
    address, 
    isEthProviderAvailable, 
    mounted,
    connector: connector?.name,
    availableConnectors: connectors.map(c => ({ id: c.id, name: c.name }))
  })

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className="bg-white text-black w-full rounded-lg p-2 text-sm font-medium"
        disabled
      >
        Loading...
      </button>
    )
  }

  // Check if connected first (works for both Farcaster and web)
  if (isConnected && address) {
    return (
      <div className="border border-[#333] rounded-xl p-3 space-y-2">
        <p className="text-xs text-gray-300 text-center">
          <span className="bg-white text-black font-mono rounded-md px-2 py-1.5">
            {shortenAddress(address)}
          </span>
        </p>
        
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white w-full rounded-lg p-2 text-sm font-medium active:scale-95 transition"
          onClick={() => disconnect()}
        >
          Disconnect Wallet
        </button>
      </div>
    )
  }

  // Show connect button if not connected
  if (!isEthProviderAvailable) {
    return (
      <button
        type="button"
        className="bg-white text-black w-full rounded-lg p-2 text-sm font-medium active:scale-95 transition"
        onClick={() => open()}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <button
      type="button"
      className="bg-white text-black w-full rounded-lg p-2 text-sm font-medium active:scale-95 transition"
      onClick={() => open()}
    >
      Connect Wallet
    </button>
  )
}
