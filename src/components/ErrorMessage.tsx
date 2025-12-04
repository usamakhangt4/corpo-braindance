import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message: string
  className?: string
  variant?: 'default' | 'destructive' | 'warning'
  showIcon?: boolean
}

const variantClasses = {
  default: 'bg-destructive/10 border-destructive/30 text-destructive',
  destructive: 'bg-status-error border-status-error/30 text-status-error',
  warning: 'bg-status-warning border-status-warning/30 text-status-warning',
}

export function ErrorMessage({
  message,
  className,
  variant = 'default',
  showIcon = true,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-md border text-sm',
        variantClasses[variant],
        className,
      )}
    >
      {showIcon && <AlertCircle className="w-4 h-4 shrink-0" />}
      <span>{message}</span>
    </div>
  )
}

