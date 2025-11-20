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
    return 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36';
  };

  const getFrameStyle = () => {
    return {
      backgroundImage: `url('/all%20assets/general%20stone%20frame%20display.png')`,
      backgroundSize: 'cover',
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
          backgroundUrl = `url(/all%20assets/general%20grid%20medium%20mode.png)`;
        } else {
          backgroundUrl = `url(/all%20assets/general%20grid%20Hard%20mode.png)`;
        }
        return backgroundUrl;
      case 'safe':
        return '';
      case 'trap':
        return '';
      default:
        return '';
    }
  };

  const getTileBackgroundSize = () => {
    if (tile === 'hidden' && (gameMode === 'medium' || gameMode === 'hard')) {
      return '80%';
    }
    return 'cover';
  };

  const getTileBackgroundRepeat = () => {
    if (tile === 'hidden' && (gameMode === 'medium' || gameMode === 'hard')) {
      return 'repeat';
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
        backgroundColor: 'rgba(0,0,0,0.3)',
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

  const maxPotentialMultiplier = Math.pow(config.multiplierStep, config.rows);
  const maxPotentialReward = betAmount * maxPotentialMultiplier;
  const currentRowDisplay = currentRow + 1;
  const remainingRows = config.rows - currentRow;

  useEffect(() => {
    if (multiplier > 1) {
      setShowMultiplierPopup(true);
      const timer = setTimeout(() => {
        setShowMultiplierPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [multiplier]);

  if (!grid.length) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
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
    <div className="relative h-[70vh] w-full overflow-hidden">
      <div
        className="h-full w-full z-10 object-cover"
        style={{
          backgroundImage: 'url(/all%20assets/game%20background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className=" h-full w-full z-10">
      <div
        className="absolute top-[-10px] left-1/3 transform -translate-x-1/2 z-30 flex justify-center items-center"
      >
        <div className="relative">
          {status === 'won' && (
            <div
              className="absolute -bottom-2 left-1/3 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold"
            >
            </div>
          )}
          {status === 'cashed_out' && (
            <div
              className="absolute -bottom-2 left-1/3 transform -translate-x-1/2 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold"
            >
              CASHED OUT!
            </div>
          )}
          {status === 'lost' && (
            <div
              className="absolute -bottom-2 left-1/3 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold"
            >
              GAME OVER
            </div>
          )}
        </div>
      </div>


      {showMultiplierPopup && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          transition={{ duration: 0.3 }}
        >
        </motion.div>
      )}

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

                window.dispatchEvent(new CustomEvent('balanceUpdated'));

                const { cashOut } = useGameStore.getState();
                cashOut();
              } catch (error) {
                console.error('Failed to cashout:', error);
                alert(`Failed to cashout: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }}
            className="bg-gradient-to-r whitespace-nowrap from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white px-6 py-2 fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50 rounded-xl font-bold transition-all duration-200 shadow-lg shadow-yellow-500/30 border border-yellow-400/50 text-base"
          >
            Cash Out {currentPayout.toFixed(2)} MON
          </button>
        </motion.div>
      )}

      <div className="flex flex-col absolute top-4 items-end h-full w-full px-4">
      <img
            src={getChestDisplay().image}
            alt={getChestDisplay().alt}
            className="w-18 h-20 absolute top-0 left-[36%] z-20 -translate-x-[-17px] object-contain"
          />
          <div className='h-fit mt-12'>
        <img src='./all%20assets/General-Border.png' alt='stone image' className='w-full object-cover h-full' />
        </div>
            {/* <div className='w-full h-[40vh] p-4'> */}
            {/* <div className='w-full h-[10vh] bg-yellow-200'></div> */}
          {/* </div> */}
        <div className={`grid ${gridConfig.gridClass} absolute top-[6rem] left-[1.5rem] z-20 gap-1 w-[84vw] p-1 items-center bg-[#4E1C0C]`}>
          {grid.map((row, rowIdx) =>
            row.map((tile, colIdx) => {
              const targetRow = config.rows - 1 - currentRow;
              const isCurrentRow = rowIdx === targetRow;
              const isClickable = status === 'playing' && isCurrentRow;

              const getTileBackground = () => {
                if (tile === 'hidden') {
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
                  return '';
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

              const getTileBackgroundColor = () => {
                if (isClickable) {
                  if (mode === 'easy') {
                    return '#D4A05A';
                  } else if (mode === 'medium') {
                    return '#8B4513';
                  } else {
                    return '#8B4513';
                  }
                } else {
                  return '#773016';
                }
              };

              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  className={`h-[4.9vh] w-full rounded-lg flex items-center justify-center text-white text-2xl font-bold ${
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
        {/* </div> */}
      </div>
      </div>

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

            <motion.button
              onClick={() => {
                const { resetGame } = useGameStore.getState();
                resetGame();
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
              <motion.div
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
              </motion.div>
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
            <motion.button
              onClick={() => {
                const { resetGame } = useGameStore.getState();
                resetGame();
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
    </div>
  );
};
