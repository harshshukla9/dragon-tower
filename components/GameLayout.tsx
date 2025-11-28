"use client";

import { motion } from "framer-motion";
import { Header } from "./Header";
import { GameBoard } from "./GameBoard";
import { Controls } from "./Controls";

export const GameLayout = () => {
  return (
    <div
      className="flex flex-col md:flex-row md:gap-6  md:justify-between md:w-fit relative bg-[#1D1B1E] md:p-2 px-2 py-4"
    >
      <div className="md:flex md:flex-col md:w-[25vw] md:rounded-xl md:overflow-hidden md:gap-2 md:bg-[#1F2326]">
      {/* // 1 */}
      <Header />
      <div className="p-2 sm:p-4 hidden md:block ">
            <Controls />
          </div>
      </div>
      {/* 2 */}
        {/* <motion.div>
          <div className="relative z-10 w-full h-full">
            <GameBoard />
          </div>
        </motion.div> */}
        <div className="w-full  md:w-fit relative h-full">
          <GameBoard />
        </div>

        {/* 3 */}
          <div className="p-2 md:hidden sm:p-4 bg-[#1F2326]">
            <Controls />
          </div>
    </div>
  );
};
