'use client';

import { motion } from 'framer-motion';
import { WalletActions } from './Home/WalletActions';
import { DepositButton } from './Home/DepositButton';
import { UserBalanceDisplay } from './Home/UserBalanceDisplay';
import { AudioController } from './AudioController';

export const Header = () => {
  return (
    <header className="bg-[#1D1B1E]">
      <div className="w-full px-3 sm:px-6 py-2 sm:py-3">
        {/* Top Row - Logo, Wallet, Profile */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Logo */}
          <img src="./LOGO/TreasureTowerLogo.png" alt="Treasure Tower Logo" className='w-[14vw] h-full' />

          {/* Wallet Actions & Profile */}
          <div
            className="flex items-center gap-2"
          >
            <WalletActions />

            <AudioController />
            
            {/* Profile Icon */}
            {/* <button className="p-2 sm:p-2.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button> */}
          </div>
        </div>

        {/* Bottom Row - User Balance & Action Buttons */}
        <motion.div
          className="flex items-center justify-between w-full gap-2"
        >
          <UserBalanceDisplay />
          <div className="flex gap-2">
            <DepositButton />
          </div>
        </motion.div>
      </div>
    </header>
  );
};