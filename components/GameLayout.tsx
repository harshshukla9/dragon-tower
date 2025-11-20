"use client";

import { motion } from "framer-motion";
import { Header } from "./Header";
import { GameBoard } from "./GameBoard";
import { Controls } from "./Controls";

export const GameLayout = () => {
  return (
    <div
      className="flex flex-col w-full relative bg-[#1D1B1E] px-2 py-4"
    >
      {/* // 1 */}
      <Header />
      {/* 2 */}
        <motion.div>
          <div className="relative z-10 w-full h-full">
            <GameBoard />
          </div>
        </motion.div>
        {/* 3 */}
          <div className="p-2 sm:p-4 bg-[#1F2326]">
            <Controls />
          </div>
    </div>
  );
};
