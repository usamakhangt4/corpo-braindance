import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'

interface ComingSoonProps {
  pageTitle: string
  pageDescription: string
}

export default function ComingSoon({ pageTitle, pageDescription }: ComingSoonProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans p-4 md:p-8 -mt-16">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
          {pageTitle}
        </h1>
        <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase">{pageDescription}</p>
        <Button variant="outline" asChild>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase mb-2 transition-colors hover:text-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
