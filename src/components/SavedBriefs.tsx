'use client'

import { BookmarkPlus, Copy, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { formatSavedBriefs } from '@/lib/buzzwords/lab'
import { ROLE_LABELS, TECH_FIELD_LABELS } from '@/lib/constants/buzzwords'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import type { DossierEntry } from '@/lib/types/buzzword'

const formatBrief = (entry: DossierEntry): string => `${entry.phrase}\n“${entry.fullSentence}”`

export function SavedBriefs() {
  const { dossier, removeFromDossier, clearDossier, restoreDossier } = useBuzzwordStore()

  const copyBrief = async (entry: DossierEntry) => {
    await navigator.clipboard.writeText(formatBrief(entry))
    toast.success('Memo copied to clipboard.')
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
    <section aria-labelledby="saved-briefs-title" className="archive-section">
      <header className="archive-header">
        <div>
          <p className="section-code section-code--inverse">MODULE / 02</p>
          <h2 id="saved-briefs-title">Archived briefs</h2>
          <p>Stored in this browser. Export anything you intend to keep.</p>
        </div>

        <div className="archive-tools">
          <span className="archive-count" aria-label={`${dossier.length} of 20 briefs saved`}>
            {String(dossier.length).padStart(2, '0')} / 20
          </span>
          {dossier.length > 0 && (
            <div className="archive-actions">
              <Button variant="outline" size="sm" onClick={() => void copyAllBriefs()} className="archive-action">
                <Copy aria-hidden="true" />
                Copy all
              </Button>
              <Button variant="ghost" size="sm" onClick={clearBriefs} className="archive-action archive-action--danger">
                <Trash2 aria-hidden="true" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </header>

      {dossier.length === 0 ? (
        <div className="archive-empty">
          <BookmarkPlus aria-hidden="true" />
          <p>
            <strong>Nothing archived.</strong>
            Save a generated brief and it will appear here.
          </p>
        </div>
      ) : (
        <div className="archive-grid" aria-label="Saved briefs">
          {dossier.map((entry, index) => (
            <article key={entry.id} className="archive-card" style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}>
              <div className="archive-card-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
              <div className="archive-card-body">
                <p className="archive-card-meta">
                  {ROLE_LABELS[entry.role]} / {entry.field ? TECH_FIELD_LABELS[entry.field] ?? 'LEGACY STACK' : 'LEGACY STACK'} / {entry.score}% JARGON
                </p>
                <h3>{entry.phrase}</h3>
                <p>{entry.fullSentence}</p>
              </div>
              <div className="archive-card-actions">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void copyBrief(entry)}
                  aria-label={`Copy ${entry.phrase}`}
                  className="archive-icon-action"
                >
                  <Copy aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeBrief(entry)}
                  aria-label={`Remove ${entry.phrase} from saved briefs`}
                  className="archive-icon-action archive-icon-action--danger"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
