import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Monad Farcaster MiniApp Template',
  description: 'A template for building mini-apps on Farcaster and Monad',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="w-full min-h-full">
      <body className={`${inter.className} w-full min-h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
