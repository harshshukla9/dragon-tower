import { useFrame } from '@/components/farcaster-provider'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { monadTestnet } from 'viem/chains'
import { formatEther } from 'viem'
import { useAccount, useBalance, useConnect } from 'wagmi'


export function WalletActions() {
  const { isEthProviderAvailable } = useFrame()
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()

  const { data: balance, isLoading } = useBalance({
    address,
    chainId: monadTestnet.id,
    // watch: true,
  })

  const shortenAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

  if (!isEthProviderAvailable) {
    return (
      <div className="border border-[#333] rounded-xl p-3 text-center text-sm">
        Wallet connection available only via farcaster
      </div>
    )
  }

  if (!isConnected) {
    return (
        <button
          type="button"
          className="bg-white text-black w-full rounded-lg p-2 text-sm font-medium active:scale-95 transition"
          onClick={() => connect({ connector: miniAppConnector() })}
        >
          Connect Wallet
        </button>
    )
  }

  return (
    <div className="border border-[#333] rounded-xl  text-center">
      <p className="text-xs text-gray-300">
        <span className="bg-white text-black font-mono rounded-md px-2 py-1.5">
          {shortenAddress(address)}
        </span>
      </p>

      {/* {isLoading ? (
        <p className="text-sm text-gray-400">Fetching balance...</p>
      ) : (
        <p className="text-base font-semibold text-white">
          MON Balance:{' '}
          <span className="font-mono text-green-400">
            {balance ? Number(formatEther(balance.value)).toFixed(4) : '0.0000'} MON
          </span>
        </p>
      )} */}
      
    </div>
  )
}
