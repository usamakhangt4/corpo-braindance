'use client'

import { useEffect } from 'react'
import { BookmarkPlus, Copy, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { BUZZWORD_ROLES, ROLE_LABELS } from '@/lib/constants/buzzwords'
import { Button } from '@/components/ui/button'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import { NeuralCard } from '@/components/NeuralCard'
import { SavedBriefs } from '@/components/SavedBriefs'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CyberBackdrop } from '@/components/CyberBackdrop'

export default function Home() {
  const { hydrated, currentBuzzword: data, role, animate, generate, fileCurrent } = useBuzzwordStore()

  useEffect(() => {
    if (hydrated && !data) {
      generate(role)
    }
  }, [data, generate, hydrated, role])

  const copyToClipboard = async () => {
    if (!data) return
    await navigator.clipboard.writeText(`${data.phrase}\n“${data.fullSentence}”`)
    toast.success('Brief copied to clipboard.')
  }

  const saveBrief = () => {
    if (!data) return
    const added = fileCurrent()
    toast[added ? 'success' : 'info'](added ? 'Brief saved in this browser.' : 'This brief is already saved.')
  }

  if (!hydrated || !data) {
    return (
      <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-surface-base p-6 text-primary">
        <CyberBackdrop />
        <LoadingSpinner message="Calibrating corporate vocabulary…" />
      </main>
    )
  }

  return (
    <main className="relative isolate min-h-svh overflow-x-clip bg-surface-base px-3 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 text-primary sm:px-5 sm:pt-10 md:px-8 md:pt-14">
      <CyberBackdrop />

      <div className="relative z-10 mx-auto max-w-5xl">
      <header className="page-enter mx-auto mb-8 max-w-5xl text-center sm:mb-10">
        <div className="signal-kicker mx-auto mb-4 w-fit font-mono text-[10px] uppercase tracking-[0.3em] text-neural-primary-hover sm:text-xs sm:tracking-[0.38em]">
          <span aria-hidden="true" className="signal-kicker__dot" />
          Local synthesis online
        </div>
        <h1 translate="no" aria-label="CORPO // BRAINDANCE" className="hero-lockup cursor-default text-balance bg-linear-to-r from-yellow-300 via-pink-500 to-cyan-400 bg-clip-text text-[clamp(2.65rem,13vw,4.75rem)] font-black uppercase leading-[0.9] tracking-[-0.055em] text-transparent">
          <span className="block sm:inline">CORPO <span aria-hidden="true">{'//'}</span></span>{' '}
          <span className="block sm:inline">BRAINDANCE</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-secondary sm:text-base md:text-lg">
          Generate satirical corporate jargon, copy it as a brief, and save your favorites in this browser.
        </p>
      </header>

      <div className="mx-auto max-w-4xl">
        <section aria-labelledby="generator-title" className="terminal-enter">
          <h2 id="generator-title" className="sr-only">Corporate buzzword generator</h2>

          <div className="mode-shell mx-auto mb-5 max-w-3xl sm:mb-7">
            <div className="mb-2 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-[0.2em] sm:text-xs">
              <span id="mode-label" className="text-neural-primary-hover">Choose a Mode</span>
              <span className="text-muted">Local generator</span>
            </div>
            <div role="group" aria-labelledby="mode-label" className="grid grid-cols-3 border border-neural-primary/30 bg-surface-base/75 p-1 shadow-neural backdrop-blur-md">
              {BUZZWORD_ROLES.map((candidateRole) => (
                <button
                  key={candidateRole}
                  type="button"
                  aria-pressed={role === candidateRole}
                  onClick={() => generate(candidateRole)}
                  className={`mode-button relative min-h-11 min-w-0 border px-1.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary sm:px-5 sm:text-xs sm:tracking-wider ${
                    role === candidateRole
                      ? 'border-neural-primary-hover/50 bg-neural-primary/20 text-neural-primary-light shadow-neural-accent'
                      : 'border-transparent text-muted hover:border-neural-primary/20 hover:bg-surface-elevated/50 hover:text-neural-primary-hover'
                  }`}
                >
                  {ROLE_LABELS[candidateRole]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <NeuralCard animate={animate}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded border border-neural-primary/50 bg-neural-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-neural-primary-hover backdrop-blur-sm sm:px-3 sm:text-xs sm:tracking-[0.2em]">
                  [{ROLE_LABELS[data.role]} MODE]
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted sm:text-xs">Synergy</span>
                  <span className={`text-lg font-bold tabular-nums sm:text-xl ${data.score > 90 ? 'text-status-success' : 'text-status-warning'}`}>
                    {data.score}%
                  </span>
                </div>
              </div>

              <div key={data.phrase} aria-live="polite" aria-atomic="true" aria-busy={animate}>
                <p
                  data-testid="generated-phrase"
                  className="phrase-reveal mb-7 break-words text-center font-serif text-[clamp(2rem,8vw,3.25rem)] font-medium leading-[1.08] text-primary sm:mb-8 md:text-left"
                >
                  “{data.phrase}”
                </p>

                <div className="brief-reveal rounded-lg border border-neural-primary/20 bg-surface-elevated/65 p-4 shadow-lg backdrop-blur-sm sm:p-5">
                  <p className="break-words font-mono text-xs leading-relaxed text-neural-primary-light sm:text-sm">
                    <span className="mr-2 font-bold text-neural-primary-hover">&gt;</span>
                    {data.fullSentence}
                    <span aria-hidden="true" className="terminal-caret" />
                  </p>
                </div>
              </div>
            </NeuralCard>
          </div>

          <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
            <Button variant="outline" size="lg" onClick={() => generate(role)} className="cyber-action cyber-action--primary col-span-2 min-h-12 sm:col-span-1">
              <RefreshCcw aria-hidden="true" className={`h-5 w-5 ${animate ? 'animate-spin' : ''}`} />
              Generate
            </Button>
            <Button variant="slate" size="lg" onClick={copyToClipboard} className="cyber-action min-h-12 px-3">
              <Copy aria-hidden="true" className="h-5 w-5" />
              Copy Brief
            </Button>
            <Button variant="outline" size="lg" onClick={saveBrief} className="cyber-action min-h-12 px-3">
              <BookmarkPlus aria-hidden="true" className="h-5 w-5" />
              Save Brief
            </Button>
          </div>
        </section>

        <SavedBriefs />
      </div>
      </div>
    </main>
  )
}
