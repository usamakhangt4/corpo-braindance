import type { Metadata } from 'next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'

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
    <html lang="en">
      <body className={`${orbitron.variable} ${jetbrainsMono.variable} antialiased`}>
        <Navbar />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  )
}
