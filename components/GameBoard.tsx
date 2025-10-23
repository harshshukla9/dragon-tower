'use client';

import { motion } from 'framer-motion';
import { useGameStore, type TileState } from '../store/gameStore';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

interface TileProps {
  tile: TileState;
  row: number;
  col: number;
  isClickable: boolean;
  onClick: (row: number, col: number) => void;
  gameMode: 'easy' | 'medium' | 'hard';
}

const Tile = ({ tile, row, col, isClickable, onClick, gameMode }: TileProps) => {
  const getTileClasses = () => {
    const baseClasses = 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-lg transition-all duration-300 flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold cursor-pointer relative overflow-hidden';
    
    if (!isClickable) {
      return `${baseClasses} text-gray-500 cursor-not-allowed`;
    }
    
    switch (tile) {
      case 'hidden':
        return `${baseClasses} text-gray-300`;
      case 'safe':
        return `${baseClasses} text-white`;
      case 'trap':
        return `${baseClasses} text-white`;
      default:
        return baseClasses;
    }
  };

  const getFrameClasses = () => {
    return 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36'; // Larger to accommodate the frame
  };

  const getFrameStyle = () => {
    return {
      backgroundImage: `url('/all%20assets/general%20stone%20frame%20display.png')`,
      backgroundSize: 'cover', // Try cover instead of contain
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: 1,
      width: '100%',
      height: '100%'
    };
  };

  const getTileBackgroundImage = () => {
    let backgroundUrl = '';
    
    switch (tile) {
      case 'hidden':
        if (gameMode === 'easy') {
          backgroundUrl = `url(/all%20assets/Active%20play%20grid%20easy%20mode.png)`;
        } else if (gameMode === 'medium') {
          backgroundUrl = `url(/all%20assets/general%20grid%20medium%20mode.png)`; // Herringbone brick pattern
        } else {
          backgroundUrl = `url(/all%20assets/general%20grid%20Hard%20mode.png)`; // Herringbone brick pattern
        }
        return backgroundUrl;
      case 'safe':
        return ''; // No background, content will be the gem image
      case 'trap':
        return ''; // No background, content will be the skull image
      default:
        return '';
    }
  };

  const getTileBackgroundSize = () => {
    if (tile === 'hidden' && (gameMode === 'medium' || gameMode === 'hard')) {
      return '80%'; // Scale pattern for medium and hard mode
    }
    return 'cover';
  };

  const getTileBackgroundRepeat = () => {
    if (tile === 'hidden' && (gameMode === 'medium' || gameMode === 'hard')) {
      return 'repeat'; // Repeat pattern to cover entire tile
    }
    return 'no-repeat';
  };

  const getTileContent = () => {
    switch (tile) {
      case 'hidden':
        return (
          <motion.div
            className="w-full h-full flex items-center justify-center"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-gray-300">?</span>
          </motion.div>
        );
      case 'safe':
        return (
          <motion.div
            className="w-full h-full flex items-center justify-center overflow-visible"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1.5, rotate: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: 'easeOut',
              scale: { duration: 0.6, ease: 'easeOut' }
            }}
          >
            <img 
              src="/all%20assets/diamond%20safe%20grid%20mockup.png" 
              alt="Safe tile"
              className="w-[300%] h-[300%] object-contain absolute z-10"
            />
          </motion.div>
        );
      case 'trap':
        return (
          <motion.div
            className="w-full h-full flex items-center justify-center"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="text-white">💀</span>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={getTileClasses()}
      style={{
        backgroundImage: getTileBackgroundImage(),
        backgroundSize: getTileBackgroundSize(),
        backgroundPosition: 'center',
        backgroundRepeat: getTileBackgroundRepeat(),
        backgroundColor: 'rgba(0,0,0,0.3)', // Fallback for visibility
      }}
      onClick={() => isClickable && onClick(row, col)}
      whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, delay: (row + col) * 0.05 }}
    >
      {getTileContent()}
    </motion.div>
  );
};

export const GameBoard = () => {
  const { address } = useAccount();
  const { grid, currentRow, config, status, clickTile, betAmount, multiplier, cashOut, mode } = useGameStore();
  const [showMultiplierPopup, setShowMultiplierPopup] = useState(false);
  const [lastMultiplier, setLastMultiplier] = useState(1);
  
  // Determine which chest to display based on game state
  const getChestDisplay = () => {
    if (status === 'won' || status === 'cashed_out') {
      return {
        image: '/all%20assets/Winning%20Chest.png',
        alt: 'Winning Chest'
      };
    } else if (status === 'lost') {
      return {
        image: '/all%20assets/Lost%20chest.png',
        alt: 'Lost Chest'
      };
    } else {
      return {
        image: '/all%20assets/General%20chest%20display.png',
        alt: 'General Chest'
      };
    }
  };
  
  // Calculate potential rewards
  const maxPotentialMultiplier = Math.pow(config.multiplierStep, config.rows);
  const maxPotentialReward = betAmount * maxPotentialMultiplier;
  const currentRowDisplay = currentRow + 1;
  const remainingRows = config.rows - currentRow;

  // Show multiplier popup when it changes (every time user clicks a safe tile)
  useEffect(() => {
    if (multiplier > 1) {
      setShowMultiplierPopup(true);
      
      // Hide after 3 seconds
      const timer = setTimeout(() => {
        setShowMultiplierPopup(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [multiplier]);

  if (!grid.length) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-16 h-16 bg-gray-600 rounded-full opacity-50"></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-gray-600 rounded-full opacity-30"></div>
          <div className="absolute top-40 right-20 w-8 h-8 bg-gray-600 rounded-full opacity-40"></div>
        </div>
        
        <div className="text-center">
          <div className="text-6xl mb-4 opacity-50">🏰</div>
          <div className="text-xl text-gray-400">Place your bet to start climbing</div>
        </div>
      </div>
    );
  }

  const currentPayout = betAmount * multiplier;

  return (
    <div className="relative h-full w-full">
      {/* Chest Display - Top Center */}
      <motion.div
        className="absolute top-[-20px] left-1/3 transform -translate-x-1/2 z-30 flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <img 
            src={getChestDisplay().image}
            alt={getChestDisplay().alt}
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40  object-contain"
          />
          {/* Status text overlay */}
          {status === 'won' && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
             
            </motion.div>
          )}
          {status === 'cashed_out' && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              CASHED OUT!
            </motion.div>
          )}
          {status === 'lost' && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              GAME OVER
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Multiplier Popup - Top Center */}
      {showMultiplierPopup && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-4 py-2 sm:px-6 sm:py-3 text-center border-2 border-green-400 shadow-xl shadow-green-500/50">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-xs sm:text-sm text-green-100">
              ${(betAmount * multiplier).toFixed(2)}
            </div>
          </div> */}
        </motion.div>
      )}


      {/* Cashout Button - Bottom center */}
      {status === 'playing' && currentRow > 0 && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 1   }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={async () => {
              if (!address) return;

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
                
                // Dispatch event to refresh all balance displays
                window.dispatchEvent(new CustomEvent('balanceUpdated'));
                
                // Set status to cashed_out to show winning chest
                const { setStatus } = useGameStore.getState();
                setStatus('cashed_out');
                
                // After showing the chest for 2 seconds, reset the game to allow playing again
                // But don't redirect - stay on the game board
                setTimeout(() => {
                  console.log('Resetting game after cashout...');
                  const { resetGame } = useGameStore.getState();
                  resetGame();
                  console.log('Game reset completed, status should be idle');
                }, 2000);
              } catch (error) {
                console.error('Failed to cashout:', error);
                alert(`Failed to cashout: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white  py-4 fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-yellow-500/30 border border-yellow-400/50 text-lg"
          >
            💰 Cash Out ${currentPayout.toFixed(2)}
          </button>
        </motion.div>
      )}

      {/* Game Grid - Full Width with proper spacing */}
      <div className="flex flex-col items-center justify-center h-full w-full px-2 sm:px-4 pt-16 sm:pt-20 pb-16">
        {/* Stone frame border around the entire grid */}
        <div 
          className="relative inline-block"
          style={{
            backgroundImage: `url('/all%20assets/general%20stone%20frame%20display1-Photoroom.png')`,
             backgroundSize: '100% 140%',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             padding: '80px 25px 10px 25px', // Top, Right, Bottom, Left padding for custom frame positioning
             width: 'fit-content',
             height: 'fit-content'
          }}
        >
           <div className="flex flex-col justify-center items-center space-y-1.5 sm:space-y-2 md:space-y-3 p-4">
          {grid.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              className="flex space-x-1.5 sm:space-x-2 md:space-x-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.1 }}
            >
              {row.map((tile, colIndex) => {
                // Calculate which row should be clickable (bottom to top)
                const targetRow = config.rows - 1 - currentRow;
                  return (
                    <Tile
                      key={`${rowIndex}-${colIndex}`}
                      tile={tile}
                      row={rowIndex}
                      col={colIndex}
                      isClickable={
                        status === 'playing' && 
                        rowIndex === targetRow &&
                        tile === 'hidden'
                      }
                      onClick={clickTile}
                      gameMode={mode}
                    />
                  );
              })}
            </motion.div>
          ))}
          </div>
        </div>
      </div>


      {/* Game Status Messages */}
      {status === 'won' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="text-center rounded-xl p-4 backdrop-blur-sm relative"
            style={{
              backgroundImage: 'url(/all%20assets/Winning%20Chest.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '300px',
              minWidth: '250px'
            }}
          >
            <div className="text-sm font-bold text-green-400 mb-1">Victory!</div>
            <div className="text-xs text-gray-300 mb-2">Top of tower!</div>
            <div className="text-sm font-bold text-white mb-2">
              {multiplier.toFixed(2)}x
            </div>
            <div className="text-sm font-bold text-yellow-400">
              ${(betAmount * multiplier).toFixed(2)}
            </div>
          </div>
        </motion.div>
      )}

      {status === 'lost' && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="text-center rounded-xl p-8 backdrop-blur-sm relative"
            style={{
              backgroundImage: 'url(/all%20assets/failed%20button%20mockup.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '400px',
              minWidth: '300px'
            }}
          >
           <div className="text-lg text-red-500">
              Lost: {betAmount.toFixed(2)}
            </div>
            <div className="text-3xl font-bold text-red-400 mb-2">Game Over!</div>
          
           
          </div>
         
        </motion.div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-4 w-8 h-8 bg-gray-600 rounded-full"></div>
        <div className="absolute bottom-20 right-4 w-6 h-6 bg-gray-600 rounded-full"></div>
        <div className="absolute top-40 right-8 w-4 h-4 bg-gray-600 rounded-full"></div>
        <div className="absolute bottom-40 left-8 w-6 h-6 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
};
