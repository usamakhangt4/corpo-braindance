import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  message?: string
  className?: string
  dotClassName?: string
  messageClassName?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    dot: 'w-2 h-2',
    message: 'text-xs',
  },
  md: {
    dot: 'w-3 h-3',
    message: 'text-sm',
  },
  lg: {
    dot: 'w-4 h-4',
    message: 'text-base',
  },
}

export function LoadingSpinner({
  message,
  className,
  dotClassName,
  messageClassName,
  size = 'md',
}: LoadingSpinnerProps) {
  const sizeConfig = sizeClasses[size]

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-6', className)}>
      {/* Loading Animation */}
      <div className="flex space-x-2">
        <div
          className={cn(
            'bg-neural-primary-hover rounded-full animate-bounce',
            sizeConfig.dot,
            dotClassName,
          )}
          style={{ animationDelay: '0s' }}
        />
        <div
          className={cn(
            'bg-neural-primary-hover rounded-full animate-bounce',
            sizeConfig.dot,
            dotClassName,
          )}
          style={{ animationDelay: '0.2s' }}
        />
        <div
          className={cn(
            'bg-neural-primary-hover rounded-full animate-bounce',
            sizeConfig.dot,
            dotClassName,
          )}
          style={{ animationDelay: '0.4s' }}
        />
      </div>
      {/* Loading Message */}
      {message && (
        <p className={cn('text-neural-primary-hover font-mono tracking-wider uppercase', sizeConfig.message, messageClassName)}>
          {message}
        </p>
      )}
    </div>
  )
}

