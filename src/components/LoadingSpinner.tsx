import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export function LoadingSpinner({ message = 'Loading…', className }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={cn('loading-lockup', className)}>
      <span className="loading-lockup-code">CB / STARTUP</span>
      <div aria-hidden="true" className="loading-track">
        <span />
      </div>
      <p>{message}</p>
    </div>
  )
}
