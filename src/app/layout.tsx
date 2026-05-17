import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { UserProvider } from '@/components/providers/UserProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'Rinse & Repeat CEO  -  Enter Your CEO Era',
    template: '%s | Rinse & Repeat CEO',
  },
  description:
    'The all-in-one business dashboard for ambitious women building their dream brands, businesses, and empires. Step-by-step startup roadmaps, real tools, zero fluff.',
  keywords: [
    'startup app',
    'women entrepreneurs',
    'business roadmap',
    'CEO dashboard',
    'online business',
    'founder tools',
    'Shopify brand',
    'digital products',
  ],
  authors: [{ name: 'Rinse & Repeat CEO' }],
  creator: 'Rinse & Repeat CEO',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Rinse & Repeat CEO  -  Enter Your CEO Era',
    description: 'The all-in-one business dashboard for ambitious women founders.',
    siteName: 'Rinse & Repeat CEO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rinse & Repeat CEO',
    description: 'Enter your CEO era. Build your dream business.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAFAFA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#FAFAFA] text-[#18181B] antialiased">
        <UserProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#18181B',
                color: '#FAFAFA',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              },
              success: {
                iconTheme: { primary: '#16A34A', secondary: '#FAFAFA' },
              },
              error: {
                iconTheme: { primary: '#DC2626', secondary: '#FAFAFA' },
              },
            }}
          />
        </UserProvider>
      </body>
    </html>
  )
}
