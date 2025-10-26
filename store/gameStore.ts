import { create } from 'zustand';

export type GameMode = 'easy' | 'medium' | 'hard';
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost' | 'cashed_out';
export type TileState = 'hidden' | 'safe' | 'trap';

interface GameConfig {
  rows: number;
  cols: number;
  safeTiles: number;
  probability: number;
  multiplierStep: number;
}

const GAME_CONFIGS: Record<GameMode, GameConfig> = {
  easy: {
    rows: 9,
    cols: 4,
    safeTiles: 3,
    probability: 0.75,
    multiplierStep: 1.266667,
  },
  medium: {
    rows: 9,
    cols: 3,
    safeTiles: 2,
    probability: 0.6667,
    multiplierStep: 1.425000,
  },
  hard: {
    rows: 8,
    cols: 2,
    safeTiles: 1,
    probability: 0.5,
    multiplierStep: 1.900000,
  },
};

interface GameState {
  // Game configuration
  mode: GameMode;
  config: GameConfig;
  
  // Game state
  currentRow: number;
  grid: TileState[][];
  actualGrid: TileState[][];
  status: GameStatus;
  multiplier: number;
  betAmount: number;
  walletAddress?: string;
  
  // Actions
  setMode: (mode: GameMode) => void;
  setBetAmount: (amount: number) => void;
  setWalletAddress: (address: string) => void;
  setStatus: (status: GameStatus) => void;
  startGame: () => void;
  clickTile: (row: number, col: number) => void;
  cashOut: () => void;
  resetGame: () => void;
  handleGameEnd: (isWin: boolean, betAmount: number, multiplier: number) => Promise<void>;
}

const generateRow = (cols: number, safeTiles: number): { hidden: TileState[], actual: TileState[] } => {
  const hiddenRow: TileState[] = new Array(cols).fill('hidden');
  const actualRow: TileState[] = new Array(cols).fill('trap');
  const safePositions = new Set<number>();
  
  // Randomly select safe tile positions
  while (safePositions.size < safeTiles) {
    const pos = Math.floor(Math.random() * cols);
    safePositions.add(pos);
  }
  
  // Set safe tiles in actual row
  for (let i = 0; i < cols; i++) {
    if (safePositions.has(i)) {
      actualRow[i] = 'safe';
    }
  }
  
  return { hidden: hiddenRow, actual: actualRow };
};

const generateGrid = (config: GameConfig): { grid: TileState[][], actualGrid: TileState[][] } => {
  const grid: TileState[][] = [];
  const actualGrid: TileState[][] = [];
  
  for (let row = 0; row < config.rows; row++) {
    const { hidden, actual } = generateRow(config.cols, config.safeTiles);
    grid.push(hidden);
    actualGrid.push(actual);
  }
  
  return { grid, actualGrid };
};

export const useGameStore = create<GameState>((set, get) => ({
  mode: 'easy',
  config: GAME_CONFIGS.easy,
  currentRow: 0,
  grid: [],
  actualGrid: [],
  status: 'idle',
  multiplier: 1,
  betAmount: 0,
  walletAddress: undefined,

  setMode: (mode: GameMode) => {
    const config = GAME_CONFIGS[mode];
    const { grid, actualGrid } = generateGrid(config);
    set({
      mode,
      config,
      grid,
      actualGrid,
      currentRow: 0,
      status: 'idle',
      multiplier: 1,
    });
  },

  setBetAmount: (amount: number) => {
    set({ betAmount: Math.max(0, amount) });
  },

  setWalletAddress: (address: string) => {
    set({ walletAddress: address });
  },

  setStatus: (status: GameStatus) => {
    set({ status });
  },

  startGame: () => {
    const { config, betAmount } = get();
    if (betAmount <= 0) return;
    
    const { grid, actualGrid } = generateGrid(config);
    set({
      grid,
      actualGrid,
      currentRow: 0,
      status: 'playing',
      multiplier: 1,
    });
  },

  clickTile: (row: number, col: number) => {
    const { grid, actualGrid, currentRow, status, multiplier, config, betAmount, walletAddress, handleGameEnd } = get();
    
    // Change direction: start from bottom (last row) and go up
    const targetRow = config.rows - 1 - currentRow;
    
    if (status !== 'playing' || row !== targetRow) return;
    
    const actualTile = actualGrid[row][col];
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = actualTile; // Reveal the actual tile
    
    if (actualTile === 'safe') {
      const newMultiplier = multiplier * config.multiplierStep;
      const nextRow = currentRow + 1;
      
      if (nextRow >= config.rows) {
        // Reached the top - player wins
        set({
          grid: newGrid,
          currentRow: nextRow,
          multiplier: newMultiplier,
          status: 'won',
        });
        // Handle win in database
        if (walletAddress) {
          handleGameEnd(true, betAmount, newMultiplier);
        }
      } else {
        // Move to next row
        set({
          grid: newGrid,
          currentRow: nextRow,
          multiplier: newMultiplier,
        });
      }
    } else {
      // Hit a trap - game over
      set({
        grid: newGrid,
        status: 'lost',
      });
      // Handle loss in database (bet was already deducted, nothing to add)
      if (walletAddress) {
        handleGameEnd(false, betAmount, multiplier);
      }
    }
  },

  cashOut: () => {
    const { status } = get();
    if (status === 'playing') {
      set({ status: 'won' });
    }
  },

  resetGame: () => {
    set({
      currentRow: 0,
      grid: [],
      actualGrid: [],
      status: 'idle',
      multiplier: 1,
    });
  },

  handleGameEnd: async (isWin: boolean, betAmount: number, multiplier: number) => {
    const { walletAddress } = get();
    if (!walletAddress) return;

    try {
      if (isWin) {
        // Call cashout API to add winnings to balance
        const response = await fetch('/api/cashout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: walletAddress,
            betAmount: betAmount,
            multiplier: multiplier,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process win');
        }

        const result = await response.json();
        console.log('Win processed successfully:', result);
        
        // Dispatch event to refresh balance displays
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('balanceUpdated'));
        }
      }
      // If lost, nothing needs to be added to balance (bet was already deducted)
    } catch (error) {
      console.error('Failed to process game end:', error);
    }
  },
}));
