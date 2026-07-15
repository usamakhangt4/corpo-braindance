'use client'

import Link from 'next/link'
import { Archive, Clock3, HardDrive, Trash2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS } from '@/lib/constants/buzzwords'
import { ROUTES } from '@/lib/constants/routes'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'

export function DossierPanel() {
  const { dossier, history, removeFromDossier, clearDossier } = useBuzzwordStore()

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-neural-primary/30 bg-surface-elevated/75 p-5 shadow-neural backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-neural-secondary/10 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4 border-b border-elevated pb-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-neural-primary-hover">
            <Archive aria-hidden="true" className="h-4 w-4" />
            <h2 className="font-mono text-sm font-bold uppercase tracking-[0.18em]">Neural Dossier</h2>
          </div>
          <p className="text-xs leading-relaxed text-muted">Filed locally in this browser. Nothing leaves this device.</p>
        </div>
        <span className="rounded-full border border-neural-primary/30 bg-neural-primary/10 px-2.5 py-1 font-mono text-xs text-neural-primary-light">
          {dossier.length}/20
        </span>
      </div>

      <div className="relative py-5">
        {dossier.length === 0 ? (
          <div className="rounded-xl border border-dashed border-elevated bg-surface-base/40 px-4 py-6 text-center">
            <HardDrive aria-hidden="true" className="mx-auto mb-3 h-6 w-6 text-muted" />
            <p className="text-sm font-semibold text-secondary">No records filed</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">Generate a phrase, then file the ones worth preserving as evidence.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dossier.slice(0, 5).map((entry) => (
              <article key={entry.id} className="group rounded-xl border border-elevated bg-surface-base/55 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-neural-primary-dark">
                      {ROLE_LABELS[entry.role]} · {entry.score}%
                    </p>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-secondary">{entry.phrase}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromDossier(entry.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-status-error/20 hover:text-status-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary"
                    aria-label={`Remove ${entry.phrase} from dossier`}
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="relative border-t border-elevated pt-4">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            Recent transmissions
          </div>
          <div className="space-y-2">
            {history.slice(0, 3).map((entry, index) => (
              <p key={`${entry.phrase}-${index}`} className="truncate text-xs text-secondary">
                <span className="mr-2 text-neural-primary-dark">0{index + 1}</span>
                {entry.phrase}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.HALL_OF_SHAME}>
            <Trophy aria-hidden="true" className="h-4 w-4" />
            Open ranking
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={clearDossier} disabled={dossier.length === 0}>
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Clear dossier
        </Button>
      </div>
    </aside>
  )
}
