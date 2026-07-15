'use client'

import { Bookmark, BookmarkPlus, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatSavedBriefs } from '@/lib/buzzwords/lab'
import { ROLE_LABELS } from '@/lib/constants/buzzwords'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import type { DossierEntry } from '@/lib/types/buzzword'

const formatBrief = (entry: DossierEntry): string => `${entry.phrase}\n“${entry.fullSentence}”`

export function SavedBriefs() {
  const { dossier, removeFromDossier, clearDossier, restoreDossier } = useBuzzwordStore()

  const copyBrief = async (entry: DossierEntry) => {
    await navigator.clipboard.writeText(formatBrief(entry))
    toast.success('Brief copied to clipboard.')
  }

  const copyAllBriefs = async () => {
    await navigator.clipboard.writeText(formatSavedBriefs(dossier))
    toast.success('Saved briefs copied to clipboard.')
  }

  const removeBrief = (entry: DossierEntry) => {
    removeFromDossier(entry.id)
    toast.success('Brief removed.', {
      action: {
        label: 'Undo',
        onClick: () => restoreDossier([entry]),
      },
    })
  }

  const clearBriefs = () => {
    const removedBriefs = dossier
    clearDossier()
    toast.success('Saved briefs cleared.', {
      action: {
        label: 'Undo',
        onClick: () => restoreDossier(removedBriefs),
      },
    })
  }

  return (
    <section aria-labelledby="saved-briefs-title" className="saved-briefs mt-10 border-t border-neural-primary/15 pt-6 sm:mt-12 sm:pt-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="saved-briefs__icon mt-0.5 rounded-lg border border-neural-primary/25 bg-neural-primary/10 p-2.5 text-neural-primary-hover">
            <Bookmark aria-hidden="true" className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 id="saved-briefs-title" className="text-base font-semibold text-primary sm:text-lg">Saved Briefs</h2>
              <span
                className="rounded-full border border-base bg-surface-elevated px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted"
                aria-label={`${dossier.length} of 20 briefs saved`}
              >
                {dossier.length}/20
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">Favorites stored only in this browser.</p>
          </div>
        </div>

        {dossier.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="outline" size="sm" onClick={() => void copyAllBriefs()} className="min-h-11 sm:min-h-8">
              <Copy aria-hidden="true" className="h-4 w-4" />
              Copy All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearBriefs} className="min-h-11 sm:min-h-8">
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {dossier.length === 0 ? (
        <div className="saved-empty mt-5 flex items-start gap-3 rounded-xl border border-dashed border-neural-primary/20 bg-surface-elevated/35 px-4 py-4 sm:items-center">
          <BookmarkPlus aria-hidden="true" className="h-5 w-5 shrink-0 text-muted" />
          <p className="text-pretty text-sm leading-relaxed text-secondary">
            <span className="font-semibold text-primary">No saved briefs yet.</span>{' '}
            Use “Save Brief” when you generate one worth keeping.
          </p>
        </div>
      ) : (
        <div className="saved-briefs__grid mt-5" aria-label="Saved briefs">
          {dossier.map((entry, index) => (
            <article key={entry.id} className="saved-brief-card min-w-0 rounded-xl border border-elevated bg-surface-elevated/60 p-4" style={{ animationDelay: `${Math.min(index, 6) * 55}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-neural-primary-dark">
                    {`${ROLE_LABELS[entry.role]} // ${entry.score}%`}
                  </p>
                  <h3 className="break-words text-sm font-semibold leading-snug text-primary">{entry.phrase}</h3>
                  <p className="mt-2 break-words text-xs leading-relaxed text-muted">{entry.fullSentence}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void copyBrief(entry)}
                    aria-label={`Copy ${entry.phrase}`}
                    className="size-10 text-muted hover:text-neural-primary-light sm:size-8"
                  >
                    <Copy aria-hidden="true" className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeBrief(entry)}
                    aria-label={`Remove ${entry.phrase} from saved briefs`}
                    className="size-10 text-muted hover:bg-status-error hover:text-status-error sm:size-8"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
