import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface NeuralCardProps {
  children: ReactNode
  className?: string
  showCornerBrackets?: boolean
  showScanline?: boolean
  showStatusDot?: boolean
  showBackgroundBlobs?: boolean
  animate?: boolean
}

export function NeuralCard({
  children,
  className,
  showCornerBrackets = true,
  showScanline = true,
  showStatusDot = true,
  showBackgroundBlobs = true,
  animate = false,
}: NeuralCardProps) {
  return (
    <div className="group relative w-full max-w-3xl perspective-1000">
      {showBackgroundBlobs && (
        <>
          <div className="pointer-events-none absolute -right-12 -top-12 z-0 hidden h-48 w-48 rounded-full bg-neural-primary/15 blur-3xl md:block md:h-72 md:w-72" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 z-0 hidden h-56 w-56 rounded-full bg-neural-secondary/15 blur-3xl md:block md:h-80 md:w-80" />
        </>
      )}

      <div
        data-transmitting={animate ? 'true' : 'false'}
        className={cn(
          'neural-frame relative z-10 overflow-hidden rounded-xl border border-neural-primary/40 bg-surface-base/90 p-[clamp(1.25rem,4vw,3rem)] shadow-neural-lg backdrop-blur-md transition-[transform,opacity] duration-300',
          'hover:border-neural-primary-hover/60 hover:shadow-neural-xl',
          animate && 'neural-frame--transmitting scale-[0.985]',
          !animate && 'scale-100',
          className,
        )}
      >
        {showScanline && <div aria-hidden="true" className="neural-scanlines" />}
        <div aria-hidden="true" className={cn('transmission-beam', animate && 'transmission-beam--active')} />

        {showCornerBrackets && (
          <>
            <div aria-hidden="true" className="hud-corner hud-corner--tl" />
            <div aria-hidden="true" className="hud-corner hud-corner--tr" />
            <div aria-hidden="true" className="hud-corner hud-corner--bl" />
            <div aria-hidden="true" className="hud-corner hud-corner--br" />
          </>
        )}

        {showStatusDot && (
          <div aria-hidden="true" className="signal-node absolute right-4 top-4 h-2 w-2 rounded-full bg-neural-primary-hover shadow-neural-accent" />
        )}

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}

