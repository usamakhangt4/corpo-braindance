import type { Metadata } from 'next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import Navbar from '../components/Navbar'
import SplashScreen from '../components/splash-screen'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'

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
  description: 'CORPO // BRAINDANCE',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${orbitron.variable} ${jetbrainsMono.variable} antialiased`}>
        <QueryProvider>
          <SplashScreen />
          <Suspense fallback={<div className="h-16" />}>
            <Navbar />
          </Suspense>
          <div className="pt-16">{children}</div>
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  )
}
