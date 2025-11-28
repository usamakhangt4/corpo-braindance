'use client'

import { useEffect } from 'react'
import { useBuzzword } from '@/hooks/use-buzzword'
import { FilePenLine, RefreshCcw } from 'lucide-react'
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { BUZZWORD_ROLES, ROLE_LABELS } from '@/lib/constants/buzzwords'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { data, role, animate, setRole, generate } = useBuzzword('ceo')

  const { user } = useAuth()
  // Initialize
  useEffect(() => {
    generate(role)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = () => {
    if (!data) return
    navigator.clipboard.writeText(`${data.phrase}\n"${data.fullSentence}"`)
    alert('Synergy successfully leveraged to clipboard!')
  }

  const submitToHR = async () => {
    if (!data) return
    try {
      await BuzzwordService.submitBuzzword(data)
      alert('Filed to Permanent Record.')
    } catch (error) {
      alert('Error: HR rejected your submission.')
      console.error(error)
    }
  }

  if (!data) return null

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-3xl text-center mb-10 mt-8">
        <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
          CORPO // BRAINDANCE
        </h1>
        <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase">Neural Link Established</p>
        <p className="text-slate-400 text-lg">Generate enterprise-grade nonsense for 2025.</p>
      </header>
      {/* Role Switcher Tabs - Neural Interface Mode Selector */}
      <div className="relative flex items-center gap-2 mb-8">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider border-r border-cyan-500/30 pr-4">
          [MODE]
        </span>
        <div className="flex bg-slate-950/80 border-2 border-cyan-500/30 p-1 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          {BUZZWORD_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r)
                generate(r)
              }}
              className={`
                relative px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200
                ${
                  role === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-900/50 border border-transparent hover:border-cyan-500/20'
                }
              `}
            >
              {role === r && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-cyan-400 text-[10px]">&gt;</span>
              )}
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card - Holographic Neural Interface Display */}
      <div className="w-full max-w-2xl relative group perspective-1000">
        {/* Background Gradient Blobs - Neural energy fields */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"></div>
        <div
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-magenta-500/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>

        <div
          className={`
            relative bg-slate-950/90 backdrop-blur-sm border-2 border-cyan-500/40 rounded-lg p-8 md:p-12 shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden transition-all duration-300 z-10
            hover:border-cyan-400/60 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]
            before:absolute before:inset-0 before:bg-linear-to-br before:from-cyan-500/10 before:via-transparent before:to-magenta-500/10 before:pointer-events-none
            ${animate ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
        `}
        >
          {/* Holographic scanline effect */}
          <div
            className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(6,182,212,0.03)_50%)] bg-size-[100%_4px] pointer-events-none opacity-30"
            style={{
              animation: 'scanline 8s linear infinite',
            }}
          ></div>

          {/* Corner brackets - terminal/holographic frame */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60"></div>

          {/* Neural link indicator - pulsing status dot */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Label */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm px-3 py-1 rounded">
                [{data.role} MODE]
              </span>

              {/* Fun "Synergy Score" */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Synergy Score:</span>
                <span className={`text-xl font-bold ${data.score > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {data.score}%
                </span>
              </div>
            </div>

            {/* The Phrase */}
            <h2 className="text-3xl md:text-5xl font-serif font-medium text-slate-100 leading-tight mb-8">
              "{data.phrase}"
            </h2>

            {/* The "Meaning" - Terminal output style */}
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-5 shadow-lg backdrop-blur-sm">
              <p className="text-cyan-300 font-mono text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold mr-2">&gt;</span>
                {data.fullSentence}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-md">
        <Button variant="gradient" size="xl" onClick={() => generate(role)} className="w-full md:w-1/2">
          <RefreshCcw className={`w-6 h-6 ${animate ? 'animate-spin' : ''}`} />
          Generate
        </Button>

        <Button
          variant="slate"
          size="xl"
          onClick={() => {
            if (user && user.email) {
              submitToHR()
            }
            copyToClipboard()
          }}
          className="w-full md:w-1/2"
        >
          <FilePenLine className="w-6 h-6" />
          <span>{user && user.email ? 'Submit to HR' : 'Copy to Clipboard'}</span>
        </Button>
      </div>
    </main>
  )
}
