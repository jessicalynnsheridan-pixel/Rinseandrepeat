import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Your Entrepreneur Type | CEO Quiz',
  description:
    'Not what sounds impressive — the business model that actually fits your personality. Free 3-minute quiz for women entrepreneurs.',
  openGraph: {
    title: 'What Type of Entrepreneur Are You? 👑',
    description:
      'Find your actual business match — free 3-minute quiz. Creator? Strategist? Service Pro? Find out.',
    type: 'website',
    siteName: 'Rinse & Repeat CEO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Type of Entrepreneur Are You? 👑',
    description: 'Free 3-minute quiz — find your actual business match.',
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
