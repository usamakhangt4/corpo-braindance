import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Gradient Blobs - Neural energy fields */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-64 h-64 bg-magenta-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Main Card - Error Display */}
      <div className="relative w-full max-w-2xl z-10">
        <div className="relative bg-slate-950/90 backdrop-blur-sm border-2 border-red-500/40 rounded-lg p-8 md:p-12 shadow-[0_0_30px_rgba(239,68,68,0.4)] overflow-hidden">
          {/* Holographic scanline effect */}
          <div
            className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(239,68,68,0.03)_50%)] bg-size-[100%_4px] pointer-events-none opacity-30"
            style={{
              animation: 'scanline 8s linear infinite',
            }}
          ></div>

          {/* Corner brackets - terminal/holographic frame */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-400/60"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-400/60"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-400/60"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-400/60"></div>

          {/* Error indicator - pulsing status dot */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Error Label */}
            <div className="flex justify-center items-center mb-6">
              <span className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] border border-red-500/50 bg-red-500/10 backdrop-blur-sm px-3 py-1 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                [ERROR 404]
              </span>
            </div>

            {/* Error Code */}
            <h1 className="glitch-text cursor-default text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-linear-to from-red-300 via-pink-500 to-magenta-400 mb-4 uppercase tracking-tighter">
              404
            </h1>

            {/* Error Message */}
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-slate-100 leading-tight mb-6">
              Neural Link Disrupted
            </h2>

            {/* Terminal output style message */}
            <div className="bg-slate-900/60 border border-red-500/20 rounded-lg p-5 shadow-lg backdrop-blur-sm mb-8">
              <p className="text-red-300 font-mono text-sm leading-relaxed">
                <span className="text-red-400 font-bold mr-2">&gt;</span>
                Target destination not found in neural network. The requested pathway has been terminated or does not
                exist.
              </p>
            </div>

            {/* Action Button */}
            <Link href={ROUTES.HOME}>
              <Button variant="gradient" size="xl" className="w-full md:w-auto">
                <Home className="w-5 h-5" />
                Return to Base Station
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <p className="mt-8 text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase text-center">
        System Status: Operational
      </p>
    </main>
  )
}

