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

  ///// Fahad
  // Actual grid
  console.log("how many grid", grid);
  
  const getGridConfig = () => {
    switch (mode) {
      case 'easy':
        return {
          cols: 4,
          rows: 9,
          totalBoxes: 36,
          gridClass: 'grid-cols-4 grid-rows-9'
        };
      case 'medium':
        return {
          cols: 3,
          rows: 9,
          totalBoxes: 27,
          gridClass: 'grid-cols-3 grid-rows-9'
        };
      case 'hard':
        return {
          cols: 2,
          rows: 9,
          totalBoxes: 18,
          gridClass: 'grid-cols-2 grid-rows-9'
        };
      default:
        return {
          cols: 4,
          rows: 9,
          totalBoxes: 36,
          gridClass: 'grid-cols-4 grid-rows-9'
        };
    }
  };

  const gridConfig = getGridConfig();
  ///// Fahad

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
        className="absolute top-[-10px] left-1/3 transform -translate-x-1/2 z-30 flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <img 
            src={getChestDisplay().image}
            alt={getChestDisplay().alt}
            className="w-18 h-20 -translate-x-[-17px] sm:w-20 sm:h-20 object-contain"
          />
          {/* Status text overlay */}
          {status === 'won' && (
            <motion.div
              className="absolute -bottom-2 left-1/3 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
             
            </motion.div>
          )}
          {status === 'cashed_out' && (
            <motion.div
              className="absolute -bottom-2 left-1/3 transform -translate-x-1/2 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              CASHED OUT!
            </motion.div>
          )}
          {status === 'lost' && (
            <motion.div
              className="absolute -bottom-2 left-1/3 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold"
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
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
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
                
                // Set status to cashed_out to show winning chest popup
                const { setStatus } = useGameStore.getState();
                setStatus('cashed_out');
              } catch (error) {
                console.error('Failed to cashout:', error);
                alert(`Failed to cashout: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white px-6 py-2 fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-yellow-500/30 border border-yellow-400/50 text-base"
          >
            💰 Cash Out ${currentPayout.toFixed(2)}
          </button>
        </motion.div>
      )}

      {/* Game Grid - Full Width with proper spacing */}
      <div className="flex flex-col items-center h-full w-full px-2 pt-8 pb-4">
        {/* Stone frame border around the entire grid */}
        <div 
          className="relative w-full"
          style={{
            backgroundImage: `url('/all%20assets/general%20stone%20frame%20display1-Photoroom.png')`,
             backgroundSize: '100% 120%',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
            padding: '60px 12px 8px 10px', // Top, Right, Bottom, Left padding for custom frame positioning
          }}
        >
           <div className={`grid ${gridConfig.gridClass} gap-1 w-full p-1 items-center bg-[#4E1C0C]`}>
          {grid.map((row, rowIdx) => 
            row.map((tile, colIdx) => {
              // Calculate the actual row index from bottom to top
              const targetRow = config.rows - 1 - currentRow;
              const isCurrentRow = rowIdx === targetRow;
              const isClickable = status === 'playing' && isCurrentRow;
              
              // Get the tile background based on state - only active row is golden
              const getTileBackground = () => {
                if (tile === 'hidden') {
                  // Use "Active play grid" for clickable row, "general grid" for inactive rows
                  const gridType = isClickable ? 'Active%20play%20grid' : 'general%20grid';
                  
                  if (mode === 'easy') {
                    return `url('/all%20assets/${gridType}%20easy%20mode.png')`;
                  } else if (mode === 'medium') {
                    return `url('/all%20assets/${gridType}%20medium%20mode.png')`;
                  } else {
                    return `url('/all%20assets/${gridType}%20Hard%20mode.png')`;
                  }
                }
                return '';
              };

              const getTileContent = () => {
                if (tile === 'hidden') {
                  return '?';
                } else if (tile === 'safe') {
                  return (
                    <motion.img 
                      src="/all%20assets/diamond%20reward.png" 
                      alt="Safe"
                      className="w-full h-full object-contain scale-150"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1.5, rotate: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  );
                } else if (tile === 'trap') {
                  return '💀';
                }
                return null;
              };

              // Get background color based on mode - only active row is golden
              const getTileBackgroundColor = () => {
                if (isClickable) {
                  // Active/clickable row - golden/bright
                  if (mode === 'easy') {
                    return '#D4A05A'; // Bright golden for active easy mode
                  } else if (mode === 'medium') {
                    return '#8B4513'; // Saddle brown for active medium
                  } else {
                    return '#8B4513'; // Saddle brown for active hard
                  }
                } else {
                  // Inactive rows - darker brown
                  return '#773016'; // Dark brown for all inactive rows
                }
              };
              
              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  className={`h-[7vh] w-full rounded-lg flex items-center justify-center text-white text-2xl font-bold ${
                    isClickable ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: getTileBackgroundColor(),
                    backgroundImage: getTileBackground(),
                    backgroundSize: mode === 'easy' ? 'cover' : '80%',
                    backgroundPosition: 'center',
                    backgroundRepeat: mode === 'easy' ? 'no-repeat' : 'repeat',
                  }}
                  onClick={() => isClickable && clickTile(rowIdx, colIdx)}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                >
                  {getTileContent()}
                </motion.div>
              );
            })
          )}
          </div>
        </div>
      </div>


      {/* Game Status Messages - Winning Popup */}
      {(status === 'won' || status === 'cashed_out') && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center relative flex flex-col items-center"
            initial={{ scale: 0.5, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.6 
            }}
          >
            {/* Victory Text - Above chest - Outside of chest container */}
            <motion.div
              className="mb-4 px-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400 whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                {status === 'won' ? '🏆 VICTORY! 🏆' : '💰 CASHED OUT! 💰'}
              </div>
            </motion.div>

            {/* Chest Image Container */}
            <div 
              className="relative flex flex-col items-center justify-center"
              style={{
                backgroundImage: 'url(/all%20assets/Winning%20Chest.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '350px',
                height: '350px'
              }}
            >
              {/* Multiplier and Payout - Inside chest area, perfectly centered */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl px-6 py-3 left-1/2 transform -translate-x-1/2 border-2 border-yellow-400 shadow-xl text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {multiplier.toFixed(2)}x
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${(betAmount * multiplier).toFixed(2)}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Play Again Button */}
            <motion.button
              onClick={() => {
                const { resetGame } = useGameStore.getState();
                resetGame();
                // Dispatch event to refresh balance
                window.dispatchEvent(new CustomEvent('balanceUpdated'));
              }}
              className="mt-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              🎮 Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {status === 'lost' && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center relative"
            initial={{ scale: 0.5, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.6 
            }}
          >
            <div 
              className="relative flex flex-col items-center"
              style={{
                backgroundImage: 'url(/all%20assets/Lost%20chest.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '350px',
                height: '350px'
              }}
            >
              {/* Lost Text - Above chest */}
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
           
              </motion.div>

              {/* Lost Amount - Inside chest area */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl ml-[-60px] mt-[-45px] px-5 py-1 border-2 border-red-400 shadow-xl text-center">
                  <div className="text-lg text-red-300 mb-1">Lost</div>
                  <div className="text-2xl font-bold text-white">
                    ${betAmount.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Play Again Button */}
            <motion.button
              onClick={() => {
                const { resetGame } = useGameStore.getState();
                resetGame();
                // Dispatch event to refresh balance
                window.dispatchEvent(new CustomEvent('balanceUpdated'));
              }}
              className="mt-4 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              🎮 Play Again
            </motion.button>
          </motion.div>
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
