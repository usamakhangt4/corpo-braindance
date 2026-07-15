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
    <div className="w-full max-w-2xl relative group perspective-1000">
      {/* Background Gradient Blobs - Neural energy fields */}
      {showBackgroundBlobs && (
        <>
          <div className="hidden md:block absolute -top-8 -right-8 md:-top-20 md:-right-20 w-40 h-40 md:w-64 md:h-64 bg-neural-primary/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
          <div className="hidden md:block absolute -bottom-8 -left-8 md:-bottom-20 md:-left-20 w-40 h-40 md:w-64 md:h-64 bg-neural-primary/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse" />
          <div
            className="hidden md:block absolute -bottom-8 -left-8 md:-bottom-20 md:-left-20 w-40 h-40 md:w-64 md:h-64 bg-neural-secondary/15 rounded-full blur-3xl pointer-events-none z-0 animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </>
      )}

      <div
        className={cn(
          'relative bg-surface-base/90 backdrop-blur-sm border-2 border-neural-primary/40 rounded-lg p-4 sm:p-6 md:p-8 lg:p-12 shadow-neural-lg overflow-hidden transition-[border-color,box-shadow,transform,opacity] duration-300 z-10',
          'hover:border-neural-primary-hover/60 hover:shadow-neural-xl',
          animate && 'scale-95 opacity-80',
          !animate && 'scale-100 opacity-100',
          className,
        )}
      >
        {/* Holographic scanline effect */}
        {showScanline && (
          <div
            className="absolute inset-0 bg-[linear-gradient(transparent_50%,var(--color-glow-primary)_50%)] bg-size-[100%_4px] pointer-events-none opacity-30"
            style={{
              animation: 'scanline 8s linear infinite',
            }}
          />
        )}

        {/* Corner brackets - terminal/holographic frame */}
        {showCornerBrackets && (
          <>
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neural-primary-hover/60" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-neural-primary-hover/60" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-neural-primary-hover/60" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neural-primary-hover/60" />
          </>
        )}

        {/* Neural link indicator - pulsing status dot */}
        {showStatusDot && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-neural-primary-hover rounded-full animate-pulse shadow-neural-accent" />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}

