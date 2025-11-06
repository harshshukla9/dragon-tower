'use client';

import { motion } from 'framer-motion';
import { WalletActions } from './Home/WalletActions';
import { DepositButton } from './Home/DepositButton';
import { WithdrawButton } from './Home/WithdrawButton';
import { UserBalanceDisplay } from './Home/UserBalanceDisplay';

export const Header = () => {
  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-gray-800">
      <div className="w-full px-3 sm:px-6 py-2 sm:py-3">
        {/* Top Row - Logo, Wallet, Profile */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Logo */}
          <motion.div
            className="flex items-center flex-shrink-0 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
            Treasure Tower
            </div>
          </motion.div>

          {/* Wallet Actions & Profile */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <WalletActions />
            
            {/* Profile Icon */}
            <button className="p-2 sm:p-2.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Bottom Row - User Balance & Action Buttons */}
        <motion.div
          className="flex items-center justify-between gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UserBalanceDisplay />
          <div className="flex gap-2">
            <DepositButton />
            <WithdrawButton />
          </div>
        </motion.div>
      </div>
    </header>
  );
};