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
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Logo */}
          <img src="./LOGO/TreasureTowerLogo.png" alt="Treasure Tower Logo" className='w-[14vw] h-full' />

          <div
            className="flex items-center gap-2"
          >
            <WalletActions />

            <AudioController />
            
          </div>
        </div>

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