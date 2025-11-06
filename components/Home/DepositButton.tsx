import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useFrame } from '@/components/farcaster-provider'
import { useAccount ,useConnect,useBalance} from 'wagmi'
import { useDeposit, usePlayerDeposits } from '../../smartcontracthooks'
import { monadTestnet } from 'viem/chains'
import { formatEther } from 'viem'

export function DepositButton() {
  const { context } = useFrame()
  const [amount, setAmount] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState('')
  const depositAmountRef = useRef<string>('')
  const processedTxHashes = useRef<Set<string>>(new Set())
  const { isEthProviderAvailable } = useFrame()
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()

  const { data: balance, isLoading } = useBalance({
    address,
    chainId: monadTestnet.id,
   // watch: true,
  })


  // Ensure we're in the browser before rendering portal
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Get player's current deposits from smart contract
  const { deposits: contractDeposits, refetch: refetchDeposits } = usePlayerDeposits()

  // Deposit function
  const { deposit, isLoading: isDepositing, isConfirmed } = useDeposit({
    onSuccess: async (txHash) => {
      console.log('✅ ========== SMART CONTRACT DEPOSIT SUCCESSFUL ==========')
      console.log('🔗 Transaction Hash:', txHash)
      
      // Check if we've already processed this transaction
      if (processedTxHashes.current.has(txHash)) {
        console.log('⚠️ Transaction already processed, skipping:', txHash)
        return
      }
      
      // Mark this transaction as processed
      processedTxHashes.current.add(txHash)
      console.log('✅ Marked transaction as processed')
      
      console.log('📦 Current amount state:', amount)
      console.log('📦 depositAmountRef.current:', depositAmountRef.current)
      
      // Use the ref to get the amount that was stored when deposit was initiated
      const depositAmount = depositAmountRef.current
      console.log('💰 Using deposit amount from ref:', depositAmount)
      console.log('💰 Type of depositAmount:', typeof depositAmount)
      console.log('💰 Is depositAmount empty?', !depositAmount)
      
      // Validate the amount
      if (!depositAmount || parseFloat(depositAmount) <= 0) {
        console.error('❌ Invalid deposit amount:', depositAmount)
        console.error('❌ Ref value:', depositAmountRef.current)
        console.error('❌ State value:', amount)
        alert('Invalid deposit amount. Please try again.')
        return
      }
      
      console.log('✅ Amount validation passed')
      
      // Now save to database
      try {
        setIsProcessing(true)
        
        const requestData = {
          fid: context?.user?.fid,
          username: context?.user?.username,
          walletAddress: address,
          amount: depositAmount,
          transactionHash: txHash,
        };
        
        console.log('🚀 Sending deposit request to API:');
        console.log('👤 FID:', requestData.fid);
        console.log('👤 Username:', requestData.username);
        console.log('👤 Wallet Address:', requestData.walletAddress);
        console.log('💰 Amount:', requestData.amount);
        console.log('🔗 Transaction Hash:', requestData.transactionHash);
        
        const response = await fetch('/api/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save deposit to database')
        }

        const result = await response.json()
        console.log('✅ Deposit saved to database successfully!')
        console.log('📊 Database result:', result)
        
        // Success! Clear form and close modal
        setAmount('')
        depositAmountRef.current = '' // Clear the ref
        refetchDeposits()
        
        // Trigger refresh events for other components
        window.dispatchEvent(new CustomEvent('depositCompleted'))
        window.dispatchEvent(new CustomEvent('balanceUpdated'))
        
        alert(`🎉 Deposit successful!\n💰 Amount: ${depositAmount} MON\n🔗 Transaction: ${txHash.slice(0, 10)}...`)
        
        // Close modal after showing alert
        setIsModalOpen(false)
        
      } catch (error) {
        console.error('Failed to save deposit to database:', error)
        alert(`Deposit to smart contract succeeded, but failed to save to database: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsProcessing(false)
      }
    },
    onError: (error) => {
      console.error('Smart contract deposit failed:', error)
      alert(`Deposit failed: ${error.message}`)
      setIsProcessing(false)
    },
  })

  const handleDeposit = async () => {
    console.log('🎯 handleDeposit called')
    console.log('📝 Current amount state:', amount)
    
    if (!amount || parseFloat(amount) <= 0) {
      console.log('❌ Invalid amount, returning')
      setError('Please enter a valid amount')
      return
    }

    if (!address) {
      console.log('❌ No wallet address, returning')
      alert('Please connect your wallet first')
      return
    }

    // Check if amount exceeds wallet balance
    if (balance && parseFloat(amount) > walletBalance) {
      console.log('❌ Amount exceeds wallet balance')
      setError('You do not have enough monad')
      return
    }

    // Clear any previous errors
    setError('')

    // Store the amount in ref before calling deposit
    depositAmountRef.current = amount
    console.log('✅ Stored deposit amount in ref:', depositAmountRef.current)
    console.log('🚀 Calling deposit function with amount:', amount)
    
    await deposit(amount)
  }

  const openModal = () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }
    setError('')
    setIsProcessing(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setAmount('')
    setError('')
    setIsProcessing(false)
    depositAmountRef.current = '' // Clear the ref
  }

  // Get wallet balance in MON
  const walletBalance = balance ? Number(formatEther(balance.value)) : 0

  // Validate amount when it changes
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    setAmount(newAmount)

    // Validate if amount exceeds balance
    if (newAmount && !isLoading && balance) {
      const amountNum = parseFloat(newAmount)
      if (isNaN(amountNum) || amountNum <= 0) {
        setError('Amount must be greater than 0')
      } else if (amountNum > walletBalance) {
        setError('You do not have enough monad')
      } else {
        setError('')
      }
    } else {
      // Clear error if input is empty
      setError('')
    }
  }

  return (
    <>
      {/* Deposit Button */}
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Deposit MON
      </button>

      {/* Deposit Modal */}
      {isModalOpen && isMounted && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-in fade-in duration-200"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={closeModal}
        >
          <div 
            className="rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200 relative"
            style={{
              backgroundImage: 'url(/all%20assets/deposit%20menu%20background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Deposit MON</h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-300 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>

            {/* User Info */}
            {context?.user && (
              <div className="mb-4 p-3 bg-white/20 rounded backdrop-blur-sm">
                <p className="text-sm text-white/80">Depositing as:</p>
                <p className="font-semibold text-white">{context.user.displayName}</p>
                <p className="text-sm text-white/70">@{context.user.username}</p>
              </div>
            )}

            {/* Current Balance */}
            <div className="mb-4 p-3 bg-white/20 rounded backdrop-blur-sm">
              <p className="text-sm text-white/80">Current Deposits</p>
              <p className="text-lg font-semibold text-white">{contractDeposits} MON</p>
            </div>

            {/* Amount Input */}
            <div className="mb-4 ">
                <div className="flex flex-row space-x-2">
              <label htmlFor="amount" className="block text-sm font-medium text-white mb-2">
                Amount 
              </label>
              {isLoading ? (
        <p className="text-sm text-white/60">Fetching balance...</p>
      ) : (
        <p className="text-base font-semibold text-white">
          :{' '}
          <span className="font-mono text-purple-400">
            {balance ? Number(formatEther(balance.value)).toFixed(4) : '0.0000'}
          </span>
        </p>
      )}
      
              </div>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.0"
                step="0.001"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-white bg-white/20 placeholder-white/60 ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-white/30 focus:ring-blue-500'
                }`}
                disabled={isDepositing || isProcessing || isLoading}
              />
              {/* Error Message */}
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>


            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2 px-4 border border-white/30 text-white rounded-md hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={Boolean(isDepositing || isProcessing || !amount || !!error || isLoading || (amount && parseFloat(amount) > walletBalance))}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositing ? 'Depositing to Smart Contract...' : 
                 isProcessing ? 'Saving to Database...' : 'Deposit'}
              </button>
            </div>

            {/* Status Messages */}
            {isConfirmed && isProcessing && (
              <p className="mt-3 text-green-400 text-sm text-center">
                ✅ Smart contract deposit confirmed! Saving to database...
              </p>
            )}
            {isProcessing && !isConfirmed && (
              <p className="mt-3 text-blue-400 text-sm text-center">
                💾 Saving deposit to database...
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
