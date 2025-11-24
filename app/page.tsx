import App from '@/components/pages/app'
import { APP_URL } from '@/lib/constants'
import type { Metadata } from 'next'

const frame = {
  version: 'next',
  imageUrl: `${APP_URL}/images/feed.png`,
  button: {
    title: 'Treasure Tower',
    action: {
      type: 'launch_frame',
      name: 'Treasure Tower',
      url: APP_URL,
      splashImageUrl: `${APP_URL}/images/TreasureTowerLogo.png`,
      splashBackgroundColor: '#f7f7f7',
    },
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Treasure Tower',
    openGraph: {
      title: 'Treasure Tower',
      description: 'Treasure Tower is a game about building a tower and collecting coins',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  }
}

export default function Home() {
  return <App />
}
