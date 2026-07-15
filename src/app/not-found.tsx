import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IndustrialBackdrop } from '@/components/IndustrialBackdrop'
import { ROUTES } from '@/lib/constants/routes'

export default function NotFound() {
  return (
    <main className="poster-page error-page min-h-svh">
      <IndustrialBackdrop />
      <section className="error-layout relative z-10" aria-labelledby="not-found-title">
        <p className="error-code" aria-hidden="true">404</p>
        <div className="error-copy">
          <p className="section-code">{'/// ROUTING FAILURE'}</p>
          <h1 id="not-found-title">This memo does not exist.</h1>
          <p>The requested page was removed, renamed, or never approved by middle management.</p>
          <Button asChild variant="outline" size="lg" className="cyber-action cyber-action--primary error-return">
            <Link href={ROUTES.HOME}>
              <ArrowLeft aria-hidden="true" />
              Return to the generator
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
