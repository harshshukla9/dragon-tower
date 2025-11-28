'use client'

import { FarcasterActions } from '@/components/Home/FarcasterActions'
import { User } from '@/components/Home/User'
import { WalletActions } from '@/components/Home/WalletActions'
import { NotificationActions } from './NotificationActions'
import CustomOGImageAction from './CustomOGImageAction'
import { Haptics } from './Haptics'
import { GameLayout } from '../GameLayout'

export function Demo() {
  return (
    <div className="flex min-h-screen w-full bg-[#1D1B1E] flex-col items-center justify-center ">
      <div className="w-full space-y-6 md:space-y-0 md:w-full md:flex md:items-center md:justify-center">
        <GameLayout />
      </div>
    </div>
  )
}


        {/* <User />
        <FarcasterActions />
        <NotificationActions />
        <WalletActions />
        <CustomOGImageAction />
        <Haptics /> */}
        {/* <AssetTest /> */}
