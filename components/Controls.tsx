'use client';

import { motion } from 'framer-motion';
import { useGameStore, type GameMode } from '../store/gameStore';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

interface ControlsProps {
  onBetPlaced?: () => void;
}

interface UserBalanceData {
  balance: number
  totalDeposited: number
  totalWithdrawn: number
}

export const Controls = ({ onBetPlaced }: ControlsProps) => {
  const { address } = useAccount()
  const [userBalance, setUserBalance] = useState<UserBalanceData | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  const {
    mode,
    betAmount,
    status,
    multiplier,
    currentRow,
    setMode,
    setBetAmount,
    setWalletAddress,
    startGame,
    cashOut,
    resetGame,
  } = useGameStore();

  const isPlaying = status === 'playing';
  const hasInsufficientBalance = userBalance && betAmount > userBalance.balance;
  const canStart = (status === 'idle' || status === 'won' || status === 'lost' || status === 'cashed_out') && betAmount > 0 && !hasInsufficientBalance;
  const canCashOut = isPlaying;
  const canReset = status === 'won' || status === 'lost' || status === 'cashed_out';

  // Fetch user balance from database
  const fetchUserBalance = async () => {
    if (!address) return

    setIsLoadingBalance(true)
    try {
      const response = await fetch(`/api/user-balance?walletAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  useEffect(() => {
    fetchUserBalance()
    if (address) {
      setWalletAddress(address)
    }
  }, [address])

  // Listen for deposit completion, bet, and balance update events to refresh balance
  useEffect(() => {
    const handleDepositCompleted = () => {
      fetchUserBalance()
    }

    const handleBetPlaced = () => {
      fetchUserBalance()
    }

    const handleBalanceUpdated = () => {
      fetchUserBalance()
    }

    window.addEventListener('depositCompleted', handleDepositCompleted)
    window.addEventListener('betPlaced', handleBetPlaced)
    window.addEventListener('balanceUpdated', handleBalanceUpdated)
    return () => {
      window.removeEventListener('depositCompleted', handleDepositCompleted)
      window.removeEventListener('betPlaced', handleBetPlaced)
      window.removeEventListener('balanceUpdated', handleBalanceUpdated)
    }
  }, [])

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setBetAmount(value);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as GameMode);
  };

  const handleBetHalf = () => {
    setBetAmount(betAmount / 2);
  };

  const handleBetDouble = () => {
    setBetAmount(betAmount * 2);
  };

  const handleStartGame = async () => {
    if (canStart) {
      try {
        // Reset game state first to ensure clean start
        resetGame();
        
        // Call bet API to deduct amount from user balance
        const response = await fetch('/api/bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
            betAmount: betAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to place bet');
        }

        const result = await response.json();
        console.log('Bet placed successfully:', result);
        
        // Update local balance state
        if (userBalance) {
          setUserBalance({
            ...userBalance,
            balance: result.newBalance
          });
        }

        // Start the game
        startGame();
        
        // Only call onBetPlaced if it exists (for navigation purposes)
        if (onBetPlaced) {
          onBetPlaced();
        }
        
        // Dispatch event to refresh balance
        window.dispatchEvent(new CustomEvent('betPlaced'));
      } catch (error) {
        console.error('Failed to place bet:', error);
        alert(`Failed to place bet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (canReset) {
      resetGame();
    }
  };

  const handleCashOut = async () => {
    if (!canCashOut || !address) return;

    try {
      const response = await fetch('/api/cashout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          betAmount: betAmount,
          multiplier: multiplier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cashout');
      }

      const result = await response.json();
      console.log('Cashout successful:', result);
      
      // Update local balance state
      if (userBalance) {
        setUserBalance({
          ...userBalance,
          balance: result.newBalance
        });
      }

      // Dispatch event to refresh all balance displays
      window.dispatchEvent(new CustomEvent('balanceUpdated'));

      // Call the game store cashout
      cashOut();
    } catch (error) {
      console.error('Failed to cashout:', error);
      alert(`Failed to cashout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const totalProfit = betAmount * multiplier - betAmount;

  return (
    <div 
      className="backdrop-blur-sm rounded-xl p-6 space-y-6"
      style={{
        backgroundColor: 'rgba(0,0,0,0.3)' // Semi-transparent to show lava background
      }}
    >
      {/* Mode Tabs - Removed Auto for cleaner interface */}
     

      {/* Bet Amount */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Bet Amount</label>
          <div className="flex flex-col items-end">
            {/* <span className="text-sm text-white">{betAmount.toFixed(2)}</span>
            {userBalance && (
              <span className="text-xs text-gray-400">
                Balance: {userBalance.balance.toFixed(2)} MON
              </span>
            )} */}
          </div>
        </div>
        
        {/* Insufficient Balance Warning */}
        {hasInsufficientBalance && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="text-sm text-red-300">
                <div className="font-medium">Insufficient Balance</div>
                <div className="text-xs">
                  You need {betAmount.toFixed(2)} MON but only have {userBalance?.balance.toFixed(2)} MON
                </div>
              </div>
            </div>
          </div>
        )}
            <div className="relative">
              <div 
                className="w-full h-12 rounded-lg flex items-center px-4"
                style={{
                  backgroundImage: 'url(/all%20assets/bet%20amount%20bar.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <input
                  type="number"
                  value={betAmount || ''}
                  onChange={handleBetAmountChange}
                  placeholder="0.00000000"
                  min="0"
                  step="0.001"
                  className="w-full px-10 bg-transparent text-white placeholder-white/60 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPlaying}
                />
              </div>
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 text-sm">
            <img src="monadlogo.png" alt="Monad" width={20} height={20} className="rounded-full" />
          </span>
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
            <button
              onClick={handleBetHalf}
              disabled={isPlaying}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              1/2
            </button>
            <button
              onClick={handleBetDouble}
              disabled={isPlaying}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              2x
            </button>
          </div>
        </div>
      </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Difficulty</label>
            <div className="relative">
              <select
                value={mode}
                onChange={handleModeChange}
                className="w-full h-12 px-4 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPlaying}
              >
                <option value="easy" className="bg-gray-800 text-white">Easy</option>
                <option value="medium" className="bg-gray-800 text-white">Medium</option>
                <option value="hard" className="bg-gray-800 text-white">Hard</option>
              </select>
            </div>
          </div>

      {/* Action Buttons */}
      <div className="space-y-3">
            {/* Main Action Button */}
            <motion.button
              onClick={canStart ? handleStartGame : canCashOut ? handleCashOut : handleStartGame}
              disabled={!canStart && !canCashOut && !canReset}
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 relative"
              style={{
                backgroundImage: 'url(/all%20assets/bet%20and%20cashout%20main%20button.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'transparent'
              }}
              whileHover={canStart || canCashOut || canReset ? { scale: 1.02 } : {}}
              whileTap={canStart || canCashOut || canReset ? { scale: 0.98 } : {}}
            >
          {hasInsufficientBalance 
            ? 'Insufficient Balance' 
            : canStart 
            ? 'Bet' 
            : canCashOut 
            ? 'Cashout' 
            : canReset 
            ? 'Play Again' 
            : 'Bet'
          }
        </motion.button>

        {/* Current Multiplier Display - Show when playing */}
        {isPlaying && (
          <div className="bg-gray-700/50 rounded-lg p-4 text-center border border-gray-600/50">
            <div className="text-sm text-gray-300 mb-1">Current Multiplier</div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-sm text-gray-400">
              ${(betAmount * multiplier).toFixed(2)} available
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Row: {currentRow} | Status: {status}
            </div>
          </div>
        )}

        {/* Cashout Button - Show when playing or has bet */}
        {(isPlaying || betAmount > 0) && (
          <motion.button
            onClick={handleCashOut}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-bold text-lg transition-all duration-200 shadow-lg shadow-green-500/30 border border-green-400/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center px-5 gap-2">
             Cash Out {(betAmount * multiplier).toFixed(2)}
             <img src="monadlogo.png" alt="Monad" width={20} height={20} className="rounded-full" />
             </div>
          </motion.button>
        )}
      </div>

      {/* Total Profit */}
      {/* <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">
            Total Profit ({multiplier.toFixed(2)}x)
          </label>
          <span className="text-sm text-white">{totalProfit.toFixed(2)}</span>
        </div>
        <div className="bg-gray-700/50 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400 text-sm">
            <img src="monadlogo.png" alt="Monad" width={20} height={20} className="rounded-full" />
            </span>
            <span className="text-white font-$o text-sm">
              {totalProfit.toFixed(8)}
            </span>
          </div>
        </div>
      </div> */}

          {/* Quick Bet Buttons */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Quick Bet</label>
            <div 
              className="grid grid-cols-2 gap-2 p-4 rounded-lg"
              style={{
                backgroundImage: 'url(/all%20assets/quick%20bet%20buttons.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {[0.1, 0.5, 1, 5].map((amount) => {
                const exceedsBalance = userBalance && amount > userBalance.balance;
                return (
                  <motion.button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={isPlaying || !!exceedsBalance}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      exceedsBalance
                        ? 'text-red-300 cursor-not-allowed'
                        : 'text-white hover:text-yellow-300'
                    }`}
                    style={{ backgroundColor: 'transparent' }}
                    whileHover={!isPlaying && !exceedsBalance ? { scale: 1.05 } : {}}
                    whileTap={!isPlaying && !exceedsBalance ? { scale: 0.95 } : {}}
                    title={exceedsBalance ? `Insufficient balance (${userBalance?.balance.toFixed(2)} MON)` : ''}
                  >
                    {amount}
                  </motion.button>
                );
              })}
            </div>
          </div>
    </div>
  );
};
