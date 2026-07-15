import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  href?: string
  showFullText?: boolean
  className?: string
  logoClassName?: string
  textClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    logo: 'px-2 py-1 text-[10px]',
    text: 'text-[10px]',
    separator: 'text-[10px]',
  },
  md: {
    logo: 'px-3 py-1.5 text-xs',
    text: 'text-xs',
    separator: 'text-xs',
  },
  lg: {
    logo: 'px-4 py-2 text-sm',
    text: 'text-sm',
    separator: 'text-sm',
  },
}

export function BrandLogo({
  href = '/',
  showFullText = true,
  className,
  logoClassName,
  textClassName,
  size = 'md',
}: BrandLogoProps) {
  const sizeConfig = sizeClasses[size]

  const logoContent = (
    <div className={cn('flex items-center gap-3 group', className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-neural-primary/20 blur-xl rounded-lg group-hover:bg-neural-primary/30 transition-colors" />
        <div
          className={cn(
            'relative border border-neural-primary/30 rounded-lg bg-surface-elevated/50',
            sizeConfig.logo,
            logoClassName,
          )}
        >
          <span className="text-neural-primary-hover font-mono font-bold tracking-wider">CORPO</span>
        </div>
      </div>
      {showFullText && (
        <>
          <span className={cn('text-muted font-mono tracking-[0.3em] hidden sm:inline', sizeConfig.separator)}>
            {'//'}
          </span>
          <span
            className={cn(
              'text-neural-secondary-light font-mono font-bold tracking-wider hidden sm:inline',
              sizeConfig.text,
              textClassName,
            )}
          >
            BRAINDANCE
          </span>
        </>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logoContent}</Link>
  }

  return logoContent
}

