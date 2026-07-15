import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LocalStateHydrator } from '@/components/LocalStateHydrator'

const barlow = Barlow({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'CORPO // BRAINDANCE',
  description: 'Generate satirical corporate jargon and save your favorite briefs locally.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${barlow.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:bg-cyber-black focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:font-bold focus:uppercase focus:tracking-wider focus:text-cyber-yellow focus:outline-2 focus:outline-offset-2 focus:outline-cyber-black"
        >
          Skip to Main Content
        </a>
        <LocalStateHydrator />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
