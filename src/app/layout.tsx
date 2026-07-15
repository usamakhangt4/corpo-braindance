import type { Metadata } from 'next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import Navbar from '../components/Navbar'
import SplashScreen from '../components/splash-screen'
import { Toaster } from '@/components/ui/sonner'
import { LocalStateHydrator } from '@/components/LocalStateHydrator'

const orbitron = Orbitron({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'CORPO // BRAINDANCE',
  description: 'Generate enterprise-grade corporate nonsense and file the best artifacts locally.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${jetbrainsMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-md focus:bg-surface-elevated focus:px-4 focus:py-2 focus:text-neural-primary-light focus:ring-2 focus:ring-neural-primary"
        >
          Skip to Main Content
        </a>
        <LocalStateHydrator />
        <SplashScreen />
        <Suspense fallback={<div className="h-16" />}>
          <Navbar />
        </Suspense>
        <div id="main-content" tabIndex={-1} className="pt-16">
          {children}
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
