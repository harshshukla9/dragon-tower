'use client';

import { motion } from 'framer-motion';
import { Header } from './Header';
import { GameBoard } from './GameBoard';
import { Controls } from './Controls';

export const GameLayout = () => {
  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: 'url(/all%20assets/game%20background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#8B4513' // Fallback lava-like background
      }}
    >
      {/* Header */}
      <Header />

      {/* Main Game Area - Vertical Layout */}
      <div className="flex flex-col min-h-[calc(100vh-64px)] w-full">
        {/* Game Board - Top Section - Always visible from app load */}
        <motion.div
          className="flex-1 relative w-full"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Game Background - Now using main background */}
          <div className="absolute inset-0">
            {/* Chain patterns */}
            <div className="absolute top-10 right-10 w-8 h-8 opacity-20">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V9H21M17 20H7V9H17V20Z"/>
              </svg>
            </div>
            <div className="absolute bottom-20 left-10 w-6 h-6 opacity-15">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1L13.5 2.5L16.17 5.17C15.24 5.06 14.32 5 13.4 5H10.6C9.68 5 8.76 5.06 7.83 5.17L10.5 2.5L9 1L3 7V9H5V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V9H21M17 20H7V9H17V20Z"/>
              </svg>
            </div>
            
            {/* Broken eggshell */}
            <div className="absolute top-20 left-16 text-4xl opacity-20">🥚</div>
            
            {/* Bone/key elements */}
            <div className="absolute bottom-32 right-16 w-8 h-8 opacity-10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="text-gray-500">
                <path d="M7 2C5.9 2 5 2.9 5 4S5.9 6 7 6C8.1 6 9 5.1 9 4S8.1 2 7 2M17 2C15.9 2 15 2.9 15 4S15.9 6 17 6C18.1 6 19 5.1 19 4S18.1 2 17 2M12 7C10.9 7 10 7.9 10 9S10.9 11 12 11S14 10.1 14 9S13.1 7 12 7M7 8C5.9 8 5 8.9 5 10V12C5 13.1 5.9 14 7 14C8.1 14 9 13.1 9 12V10C9 8.9 8.1 8 7 8M17 8C15.9 8 15 8.9 15 10V12C15 13.1 15.9 14 17 14C18.1 14 19 13.1 19 12V10C19 8.9 18.1 8 17 8M12 12C10.9 12 10 12.9 10 14V16C10 17.1 10.9 18 12 18S14 17.1 14 16V14C14 12.9 13.1 12 12 12M7 16C5.9 16 5 16.9 5 18V20C5 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20V18C9 16.9 8.1 16 7 16M17 16C15.9 16 15 16.9 15 18V20C15 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20V18C19 16.9 18.1 16 17 16M12 18C10.9 18 10 18.9 10 20V22H14V20C14 18.9 13.1 18 12 18Z"/>
              </svg>
            </div>
          </div>

          {/* Game Board */}
          <div className="relative z-10 h-full p-8">
            <GameBoard />
          </div>
        </motion.div>

        {/* Controls Panel - Bottom Section - Always visible below grid */}
        <motion.div
          className="w-full bg-black/30 backdrop-blur-sm border-t border-gray-800"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="p-2 sm:p-4 ">
            <Controls />
          </div>
        </motion.div>
      </div>


    </div>
  );
};
