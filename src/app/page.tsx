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
      <main className="flex min-h-screen items-center justify-center bg-surface-base p-6 text-primary">
        <LoadingSpinner message="Calibrating corporate vocabulary…" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-base px-4 py-10 text-primary md:px-8 md:py-14">
      <header className="mx-auto mb-9 max-w-5xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-neural-primary-dark">Neural link established</p>
        <h1 className="glitch-text cursor-default text-balance bg-linear-to-r from-yellow-300 via-pink-500 to-cyan-400 bg-clip-text text-5xl font-black uppercase tracking-tighter text-transparent md:text-7xl">
          CORPO // BRAINDANCE
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
          Generate satirical corporate jargon, copy it as a brief, and save your favorites in this browser.
        </p>
      </header>

      <div className="mx-auto max-w-4xl">
        <section aria-labelledby="generator-title">
          <h2 id="generator-title" className="sr-only">Corporate buzzword generator</h2>

          <div className="mb-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <span id="mode-label" className="font-mono text-xs uppercase tracking-wider text-neural-primary-hover sm:border-r sm:border-neural-primary/30 sm:pr-4">
              Choose a Mode
            </span>
            <div role="group" aria-labelledby="mode-label" className="flex border-2 border-neural-primary/30 bg-surface-base/80 p-1 shadow-neural">
              {BUZZWORD_ROLES.map((candidateRole) => (
                <button
                  key={candidateRole}
                  type="button"
                  aria-pressed={role === candidateRole}
                  onClick={() => generate(candidateRole)}
                  className={`relative border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary sm:px-6 ${
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
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3 md:justify-between">
                <span className="rounded border border-neural-primary/50 bg-neural-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-neural-primary-hover backdrop-blur-sm">
                  [{ROLE_LABELS[data.role]} MODE]
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-muted">Synergy score</span>
                  <span className={`text-xl font-bold tabular-nums ${data.score > 90 ? 'text-status-success' : 'text-status-warning'}`}>
                    {data.score}%
                  </span>
                </div>
              </div>

              <p
                data-testid="generated-phrase"
                className="mb-8 text-center font-serif text-3xl font-medium leading-tight text-primary md:text-left md:text-5xl"
              >
                “{data.phrase}”
              </p>

              <div className="rounded-lg border border-neural-primary/20 bg-surface-elevated/60 p-5 shadow-lg backdrop-blur-sm">
                <p className="font-mono text-sm leading-relaxed text-neural-primary-light">
                  <span className="mr-2 font-bold text-neural-primary-hover">&gt;</span>
                  {data.fullSentence}
                </p>
              </div>
            </NeuralCard>
          </div>

          <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
            <Button variant="gradient" size="lg" onClick={() => generate(role)}>
              <RefreshCcw aria-hidden="true" className={`h-5 w-5 ${animate ? 'animate-spin' : ''}`} />
              Generate
            </Button>
            <Button variant="slate" size="lg" onClick={copyToClipboard}>
              <Copy aria-hidden="true" className="h-5 w-5" />
              Copy Brief
            </Button>
            <Button variant="outline" size="lg" onClick={saveBrief}>
              <BookmarkPlus aria-hidden="true" className="h-5 w-5" />
              Save Brief
            </Button>
          </div>
        </section>

        <SavedBriefs />
      </div>
    </main>
  )
}
