import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface UserBalanceData {
  balance: number
  totalDeposited: number
  totalWithdrawn: number
}

export function UserBalanceDisplay() {
  const { address } = useAccount()
  const [userBalance, setUserBalance] = useState<UserBalanceData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user balance from database
  const fetchUserBalance = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user-balance?walletAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserBalance()
  }, [address])

  // Listen for deposit completion and balance update events to refresh balance
  useEffect(() => {
    const handleDepositCompleted = () => {
      fetchUserBalance()
    }

    const handleBalanceUpdated = () => {
      fetchUserBalance()
    }

    window.addEventListener('depositCompleted', handleDepositCompleted)
    window.addEventListener('balanceUpdated', handleBalanceUpdated)
    return () => {
      window.removeEventListener('depositCompleted', handleDepositCompleted)
      window.removeEventListener('balanceUpdated', handleBalanceUpdated)
    }
  }, [])

  if (!address) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* Database Balance Display */}
      <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <div className="text-sm">
            <div className="text-gray-300">Game Balance</div>
            <div className="text-white font-semibold">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <span className="text-purple-300">
               
                {isLoading ? 'Loading...' : `${Number(userBalance?.balance || 0).toFixed(4)} MON`}

                </span>
              )}
            </div>
          </div>
        </div>
      </div>

    

      {/* Refresh Button */}
      <button
        onClick={fetchUserBalance}
        disabled={isLoading}
        className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50 disabled:opacity-50"
        title="Refresh balance"
      >
        <svg 
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>
    </div>
  )
}
