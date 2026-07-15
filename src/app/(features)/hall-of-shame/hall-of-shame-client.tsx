'use client'

import { useMemo } from 'react'
import { HardDrive, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { VotingControls } from '@/components/VotingControls'
import { rankHallEntries } from '@/lib/buzzwords/lab'
import { ROLE_LABELS } from '@/lib/constants/buzzwords'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import type { RankedHallEntry, VoteAction } from '@/lib/types/buzzword'

export function HallOfShameClient() {
  const { hydrated, dossier, localVotes, vote } = useBuzzwordStore()
  const entries = useMemo(() => rankHallEntries(dossier, localVotes), [dossier, localVotes])

  const handleVote = (entry: RankedHallEntry, action: VoteAction) => {
    vote(entry.id, action)
    const removingVote = entry.userVote === action
    toast.success(removingVote ? 'Local vote cleared.' : action === 'promote' ? 'Promoted in your ranking.' : 'Fired from your ranking.')
  }

  const shareEntry = async (entry: RankedHallEntry) => {
    await navigator.clipboard.writeText(`${entry.phrase}\n"${entry.meaning}"`)
    toast.success('Artifact copied to clipboard.')
  }

  return (
    <main className="min-h-screen bg-surface-base px-4 py-10 text-primary md:px-8 md:py-14">
      <header className="mx-auto mb-8 max-w-4xl text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.35em] text-neural-primary-dark">Curated corporate artifacts</p>
        <h1 className="glitch-text cursor-default bg-linear-to-r from-yellow-300 via-pink-500 to-cyan-400 bg-clip-text text-5xl font-black uppercase tracking-tighter text-transparent md:text-7xl">
          HALL // OF SHAME
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
          Rank the archive, add phrases from your dossier, and keep every decision inside this browser.
        </p>
      </header>

      <div className="mx-auto mb-8 flex max-w-4xl items-start gap-3 rounded-xl border border-neural-primary/30 bg-neural-primary/5 p-4 text-sm text-secondary">
        <HardDrive aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-neural-primary-hover" />
        <p>
          <strong className="text-neural-primary-light">Local simulation:</strong> votes and dossier entries are saved on this device only. No account, database, or tracking is involved.
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-4" aria-live="polite">
        {!hydrated ? (
          <LoadingSpinner message="Opening local performance records..." className="py-20" />
        ) : (
          entries.map((entry, index) => (
            <article
              key={entry.id}
              className="group relative overflow-hidden rounded-2xl border border-base bg-surface-elevated p-5 shadow-xl transition-[border-color] hover:border-neural-primary/50 md:p-6"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl" />

              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-black md:h-12 md:w-12 ${
                    index === 0
                      ? 'border-status-warning bg-status-warning/20 text-status-warning'
                      : index === 1
                        ? 'border-secondary bg-surface-overlay/20 text-secondary'
                        : index === 2
                          ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                          : 'border-elevated bg-surface-overlay/20 text-muted'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    entry.source === 'dossier'
                      ? 'border-pink-500/40 bg-pink-500/10 text-pink-300'
                      : 'border-indigo-500/30 text-indigo-400'
                  }`}>
                    {entry.source === 'dossier' ? 'Your dossier' : ROLE_LABELS[entry.role]}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">Synergy</span>
                  <span className={`text-lg font-bold ${entry.score > 90 ? 'text-status-success' : 'text-status-warning'}`}>
                    {entry.score}%
                  </span>
                </div>
              </div>

              <h2 className="mb-3 font-serif text-2xl font-medium leading-tight text-primary md:text-3xl">“{entry.phrase}”</h2>
              <div className="mb-4 rounded-xl border border-elevated/50 bg-surface-base/50 p-4 backdrop-blur-sm">
                <p className="font-mono text-sm leading-relaxed text-muted">
                  <span className="mr-2 font-bold text-indigo-400">&gt;</span>
                  {entry.meaning}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-elevated pt-3">
                <VotingControls
                  votes={entry.votes}
                  userVote={entry.userVote}
                  onUpvote={() => handleVote(entry, 'promote')}
                  onDownvote={() => handleVote(entry, 'fire')}
                />
                <button
                  type="button"
                  onClick={() => shareEntry(entry)}
                  className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium text-muted transition-[color,background-color] hover:bg-surface-overlay hover:text-neural-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary"
                  aria-label={`Copy ${entry.phrase}`}
                >
                  <Share2 aria-hidden="true" className="h-4 w-4" />
                  <span>Copy artifact</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
