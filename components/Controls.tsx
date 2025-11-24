'use client';

import { motion } from 'framer-motion';
import { useGameStore, type GameMode } from '../store/gameStore';
import { useAccount } from 'wagmi';
import { useState, useEffect, useCallback } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  const [betInputValue, setBetInputValue] = useState<string>('')
  const numericBetValue = betInputValue === '' ? 0 : parseFloat(betInputValue) || 0;

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
  const hasInsufficientBalance = userBalance && numericBetValue > userBalance.balance;
  const isBelowMinimum = numericBetValue > 0 && numericBetValue < 0.01;
  const canStart = (status === 'idle' || status === 'won' || status === 'lost' || status === 'cashed_out') && numericBetValue >= 0.01 && !hasInsufficientBalance;
  const canCashOut = isPlaying;
  const canReset = status === 'won' || status === 'lost' || status === 'cashed_out';

  const fetchUserBalance = useCallback(async () => {
    if (!address) return

    setIsLoadingBalance(true)
    try {
      const response = await fetch(`/api/user-balance?walletAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.user)
        console.log('Controls - Balance fetched:', data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }, [address])

  useEffect(() => {
    fetchUserBalance()
    if (address) {
      setWalletAddress(address)
    }
  }, [address, fetchUserBalance, setWalletAddress])

  // Don't auto-set bet amount - keep it blank on initial load
  // (removed auto-fill logic)

  useEffect(() => {
    if ((status === 'won' || status === 'lost' || status === 'cashed_out') && betAmount > 0) {
      const rounded = Math.round(betAmount * 100) / 100;
      setBetInputValue(rounded.toFixed(2))
    }
  }, [status, betAmount])

  useEffect(() => {
    if (!address) return

    const handleDepositCompleted = () => {
      console.log('Controls - Deposit completed event received')
      fetchUserBalance()
    }

    const handleBetPlaced = () => {
      console.log('Controls - Bet placed event received')
      fetchUserBalance()
    }

    const handleBalanceUpdated = () => {
      console.log('Controls - Balance updated event received')
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
  }, [address, fetchUserBalance])

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setBetInputValue('');
      return;
    }

    const sanitized = inputValue.replace(/[^0-9.]/g, '');
    const [intPart, decimalPart = ''] = sanitized.split('.');

    if (decimalPart.length > 2) {
      setBetInputValue(`${intPart}.${decimalPart.slice(0, 2)}`);
      return;
    }

    setBetInputValue(sanitized);
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(e.target.value as GameMode);
  };

  const handleBetHalf = () => {
    const newValue = numericBetValue / 2;
    const rounded = Math.round(newValue * 100) / 100;
    setBetInputValue(Math.max(0.01, rounded).toFixed(2));
  };

  const handleBetDouble = () => {
    const newValue = numericBetValue * 2;
    const rounded = Math.round(newValue * 100) / 100;
    setBetInputValue(rounded.toFixed(2));
  };

  const handleStartGame = async () => {
    if (canStart) {
      try {
        resetGame();
        const wagerAmount = Math.round(numericBetValue * 100) / 100;
        setBetAmount(wagerAmount);

        const response = await fetch('/api/bet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address,
            betAmount: wagerAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to place bet');
        }

        const result = await response.json();
        console.log('Bet placed successfully:', result);

        if (userBalance) {
          setUserBalance({
            ...userBalance,
            balance: result.newBalance
          });
        }

        startGame();
        setBetInputValue('');
        if (onBetPlaced) {
          onBetPlaced();
        }
        window.dispatchEvent(new CustomEvent('betPlaced'));
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
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

      if (userBalance) {
        setUserBalance({
          ...userBalance,
          balance: result.newBalance
        });
      }

      window.dispatchEvent(new CustomEvent('balanceUpdated'));

      cashOut();
    } catch (error) {
      console.error('Failed to cashout:', error);
      alert(`Failed to cashout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const totalProfit = betAmount * multiplier - betAmount;

  return (
    <div 
      className="py-2 px-2 flex flex-col gap-4"
    >

<div className="">
{isPlaying && (
          <div className="bg-gradient-to-r from-green-900/30 via-emerald-900/20 to-green-900/30 flex rounded-t-lg px-4 py-3 items-center justify-between border border-green-500/40 shadow-lg shadow-green-500/10">
            <div className="flex flex-col">
              <div className="text-xs uppercase tracking-wider text-green-300/70 mb-1 font-medium">
                Multiplier
              </div>
              <div className="text-3xl font-bold text-green-400 tracking-tight">
                {multiplier.toFixed(2)}<span className="text-xl">x</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs uppercase tracking-wider text-gray-400/70 mb-1 font-medium">
                Available
              </div>
              <div className="text-xl font-semibold text-white">
                {(betAmount * multiplier).toFixed(2)} <span className="text-sm text-gray-300">MON</span>
              </div>
            </div>
          </div>
        )}
            <motion.button
              onClick={canStart ? handleStartGame : canCashOut ? handleCashOut : handleStartGame}
              disabled={!canStart && !canCashOut && !canReset}
              className={`w-full py-2 text-white ${
                isPlaying ? 'rounded-b-lg' : 'rounded-lg'
              } font-semibold text-lg`}
              style={{
                backgroundImage: 'url(/all%20assets/bet%20and%20cashout%20main%20button.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'transparent'
              }}
              whileTap={canStart || canCashOut || canReset ? { scale: 0.98 } : {}}
            >
          {hasInsufficientBalance 
            ? 'Insufficient Balance' 
            : isBelowMinimum
            ? 'Minimum 0.01 MON'
            : canStart 
            ? 'Bet' 
            : canCashOut 
            ? 'Cashout' 
            : canReset 
            ? 'Play Again' 
            : 'Bet'
          }
        </motion.button>

      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Bet Amount</label>
        </div>
        {hasInsufficientBalance && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-red-300">
                <div className="font-medium">Insufficient Balance</div>
                <div className="text-xs">
                  You need {numericBetValue.toFixed(2)} MON but only have {userBalance?.balance.toFixed(2)} MON
                </div>
              </div>
            </div>
          </div>
        )}
        {isBelowMinimum && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="text-sm text-yellow-300">
                <div className="font-medium">Minimum Bet Required</div>
                <div className="text-xs">
                  Minimum bet amount is 0.01 MON
                </div>
              </div>
            </div>
          </div>
        )}
            <div className="relative flex">
              <Input 
                placeholder='0.00' 
                type="number" 
                value={betInputValue} 
                disabled={isPlaying} 
                onChange={handleBetAmountChange}
                step="0.01"
                className='flex-1 rounded-none focus:outline-none border-gray-600 bg-black text-white rounded-l-lg' 
              />
            <div className="flex">
              <button
                onClick={handleBetHalf}
                disabled={isPlaying}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-sm text-white  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                1/2
              </button>
              <button
                onClick={handleBetDouble}
                disabled={isPlaying}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-sm text-white rounded-r-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                2x
              </button>
            </div>
            </div>
      </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Difficulty</label>
            <div className="relative">
              <Select value={mode} onValueChange={(val) => setMode(val as GameMode)} disabled={isPlaying}>
                <SelectTrigger className="w-full h-12 px-4 bg-black rounded-lg text-white border-[#51545F] focus:outline-none  focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-black border border-gray-700 text-white">
                  <SelectItem value="easy" className="cursor-pointer">Easy</SelectItem>
                  <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                  <SelectItem value="hard" className="cursor-pointer">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* <div className='space-y-3'>
          <label className="text-sm font-medium text-gray-300">Total Profit (0.00x)</label>
                <Input className='focus:outline-none text-white outline-none border-[#51545F]' placeholder='0.0000'/>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Quick Bet</label>
            <div 
              className="grid grid-cols-2 gap-2 rounded-lg w-full"
            >
              {[0.1, 0.5, 1, 5].map((amount) => {
                const exceedsBalance = userBalance && amount > userBalance.balance;
                return (
                  <motion.button
                    key={amount}
                    onClick={() => setBetInputValue(amount)}
                    disabled={isPlaying || !!exceedsBalance}
                    className={`py-2 px-3 rounded-lg !bg-[#30373B] text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      exceedsBalance
                        ? 'text-red-300 cursor-not-allowed'
                        : 'text-white hover:text-[#F18301]'
                    }`}
                    style={{ backgroundColor: 'transparent' }}
                    whileTap={!isPlaying && !exceedsBalance ? { scale: 0.95 } : {}}
                    title={exceedsBalance ? `Insufficient balance (${userBalance?.balance.toFixed(2)} MON)` : ''}
                  >
                    {amount}
                  </motion.button>
                );
              })}
            </div>
          </div> */}
    </div>
  );
};
