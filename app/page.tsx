'use client'

import { useState, useEffect } from 'react'
import { generateBuzzword } from '@/lib/buzzwords'

export default function Home() {
  const [data, setData] = useState({
    phrase: '',
    meaning: '',
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setData(generateBuzzword())
    setMounted(true)
  }, [])

  const handleGenerate = () => {
    setData(generateBuzzword())
  }

  if (!mounted) return null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-white">
      <div className="max-w-4xl w-full flex flex-col items-center gap-8 text-center">
        <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
          CORPO // BRAINDANCE
        </h1>
        <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase">Neural Link Established</p>

        {/* The Main Buzzword Card */}
        <div className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-10 shadow-2xl relative overflow-hidden group">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-emerald-500"></div>

          <h2 className="text-3xl md:text-5xl font-serif italic font-light leading-tight text-white mb-6">
            "{data.phrase}"
          </h2>

          {/* The "Meaning" Section */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2 block">Translation</span>
            <p className="text-gray-300 font-mono text-sm md:text-base">{data.meaning}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Generate New Strategy
          </button>

          <button
            onClick={() => {
              const textToCopy = `${data.phrase}\n\nTranslation: ${data.meaning}`
              navigator.clipboard.writeText(textToCopy)
              alert('Strategy copied to clipboard!')
            }}
            className="px-8 py-4 bg-transparent border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-800 rounded-xl font-bold text-lg transition-all"
          >
            Copy
          </button>
        </div>
      </div>
    </main>
  )
}
