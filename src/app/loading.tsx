import { IndustrialBackdrop } from '@/components/IndustrialBackdrop'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <main className="poster-page flex min-h-svh items-center justify-center p-6">
      <IndustrialBackdrop />
      <LoadingSpinner message="Loading the corporate lexicon…" className="relative z-10" />
    </main>
  )
}
