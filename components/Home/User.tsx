import { useFrame } from '@/components/farcaster-provider'
import { DepositButton } from './DepositButton'
import { UserBalance } from './UserBalance'

export function User() {
  const { context } = useFrame()

  console.log('User component rendering, context:', context)

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      <div className="border border-red-500 rounded-md p-4 bg-red-50">
        <h2 className="text-xl font-bold text-left mb-2">🐛 Debug Info</h2>
        <p className="text-sm">User component is rendering!</p>
        <p className="text-sm">Context available: {context ? 'Yes' : 'No'}</p>
        <p className="text-sm">User available: {context?.user ? 'Yes' : 'No'}</p>
      </div>

      {/* User Info */}
      <div className="border border-[#333] rounded-md p-4">
        <h2 className="text-xl font-bold text-left mb-4">User Profile</h2>
        <div className="flex flex-row space-x-4 justify-start items-start">
          {context?.user ? (
            <>
              {context?.user?.pfpUrl && (
                <img
                  src={context?.user?.pfpUrl}
                  className="w-14 h-14 rounded-full"
                  alt="User Profile"
                  width={56}
                  height={56}
                />
              )}
              <div className="flex flex-col justify-start items-start space-y-2">
                <p className="text-sm text-left">
                  user.displayName:{' '}
                  <span className="bg-white font-mono text-black rounded-md p-[4px]">
                    {context?.user?.displayName}
                  </span>
                </p>
                <p className="text-sm text-left">
                  user.username:{' '}
                  <span className="bg-white font-mono text-black rounded-md p-[4px]">
                    {context?.user?.username}
                  </span>
                </p>
                <p className="text-sm text-left">
                  user.fid:{' '}
                  <span className="bg-white font-mono text-black rounded-md p-[4px]">
                    {context?.user?.fid}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-left">User context not available</p>
          )}
        </div>
      </div>

      {/* User Balance */}
      <UserBalance />

      {/* Deposit Button */}
      <div className="border border-[#333] rounded-md p-4">
        <h2 className="text-xl font-bold text-left mb-4">Deposit MON</h2>
        <p className="text-sm text-gray-600 mb-4">
          Deposit MON tokens to your casino vault. Your deposit will be automatically tracked in both the smart contract and our database.
        </p>
        <DepositButton />
      </div>
    </div>
  )
}
