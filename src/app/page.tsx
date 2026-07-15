'use client'

import { useEffect } from 'react'
import { BookmarkPlus, Copy, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { ROLE_LABELS, TECH_FIELD_LABELS } from '@/lib/constants/buzzwords'
import { Button } from '@/components/ui/button'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import { BriefGeneratorPanel } from '@/components/BriefGeneratorPanel'
import { GenerationProfileControl } from '@/components/GenerationProfileControl'
import { SavedBriefs } from '@/components/SavedBriefs'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { IndustrialBackdrop } from '@/components/IndustrialBackdrop'

export default function Home() {
  const { hydrated, currentBuzzword: data, role, field, animate, generate, fileCurrent } = useBuzzwordStore()

  useEffect(() => {
    if (hydrated && !data) {
      generate(role, field)
    }
  }, [data, field, generate, hydrated, role])

  const copyToClipboard = async () => {
    if (!data) return
    await navigator.clipboard.writeText(`${data.phrase}\n“${data.fullSentence}”`)
    toast.success('Memo copied to clipboard.')
  }

  const saveBrief = () => {
    if (!data) return
    const added = fileCurrent()
    toast[added ? 'success' : 'info'](added ? 'Brief saved in this browser.' : 'This brief is already saved.')
  }

  if (!hydrated || !data) {
    return (
      <main className="poster-page flex min-h-svh items-center justify-center p-6">
        <IndustrialBackdrop />
        <LoadingSpinner message="Loading the corporate lexicon…" className="relative z-10" />
      </main>
    )
  }

  return (
    <main className="poster-page min-h-svh overflow-x-clip pb-[max(3rem,env(safe-area-inset-bottom))]">
      <IndustrialBackdrop />

      <div className="page-shell relative z-10 mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-10">
        <header className="masthead page-enter">
          <div translate="no" aria-label="CORPO // BRAINDANCE" className="wordmark">
            <span>CORPO</span>
            <span aria-hidden="true" className="wordmark-slash">{'//'}</span>
            <span>BRAINDANCE</span>
          </div>
          <div className="masthead-meta" aria-label="Application status">
            <span>BUILD 04.77</span>
            <span>LOCAL / OFFLINE</span>
            <span className="masthead-status">READY</span>
          </div>
        </header>

        <div className="hero-grid">
          <header className="hero-copy page-enter">
            <p className="section-code">{'/// INTERNAL COMMS DIVISION'}</p>
            <h1 className="hero-headline">
              Make nothing{' '}
              <span>sound strategic.</span>
            </h1>
            <p className="hero-summary">
              Turn four harmless words into promotion-ready corporate nonsense. No account, no cloud, no quarterly commitment.
            </p>
            <div className="hero-facts" aria-label="Product facts">
              <span>NO LOGIN</span>
              <span>NO BACKEND</span>
              <span>20 LOCAL SLOTS</span>
            </div>
            <div aria-hidden="true" className="approval-stamp">
              <span>APPROVED FOR</span>
              <strong>ALL-HANDS</strong>
            </div>
          </header>

          <section aria-labelledby="generator-title" className="generator-workbench terminal-enter">
            <div className="module-heading">
              <div>
                <p className="section-code section-code--inverse">{'MODULE / 01'}</p>
                <h2 id="generator-title">Corporate speech fabricator</h2>
              </div>
              <span className="module-state">LOCAL PROCESS</span>
            </div>

            <GenerationProfileControl voice={role} field={field} onApply={generate} />

            <BriefGeneratorPanel animate={animate}>
              <div className="output-meta">
                <span>VOICE / {ROLE_LABELS[data.role]}</span>
                <span>STACK / {TECH_FIELD_LABELS[data.field] ?? 'LEGACY'}</span>
                <span>JARGON DENSITY <strong>{data.score}%</strong></span>
              </div>

              <div key={data.phrase} aria-live="polite" aria-atomic="true" aria-busy={animate}>
                <p data-testid="generated-phrase" className="generated-phrase phrase-reveal">
                  “{data.phrase}”
                </p>

                <div className="generated-brief brief-reveal">
                  <p>
                    <span aria-hidden="true">MEMO:</span>
                    {data.fullSentence}
                  </p>
                </div>
              </div>
            </BriefGeneratorPanel>

            <div className="generator-actions">
              <Button variant="outline" size="lg" onClick={() => generate()} className="cyber-action cyber-action--primary">
                <RefreshCcw aria-hidden="true" className={`h-5 w-5 ${animate ? 'animate-spin' : ''}`} />
                Generate jargon
              </Button>
              <Button variant="outline" size="lg" onClick={copyToClipboard} className="cyber-action">
                <Copy aria-hidden="true" className="h-5 w-5" />
                Copy memo
              </Button>
              <Button variant="outline" size="lg" onClick={saveBrief} className="cyber-action cyber-action--signal">
                <BookmarkPlus aria-hidden="true" className="h-5 w-5" />
                Save brief
              </Button>
            </div>
          </section>
        </div>

        <SavedBriefs />

        <footer className="site-footer">
          <span>CORPO // BRAINDANCE</span>
          <span>YOUR DATA NEVER LEAVES THIS DEVICE</span>
        </footer>
      </div>
    </main>
  )
}
