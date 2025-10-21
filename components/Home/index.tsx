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
    <div className="flex min-h-screen flex-col items-center justify-center ">
      <div className="w-full max-w-4xl space-y-6">
        {/* <User />
        <FarcasterActions />
        <NotificationActions />
        <WalletActions />
        <CustomOGImageAction />
        <Haptics /> */}
        {/* <AssetTest /> */}
        <GameLayout />
      </div>
    </div>
  )
}
