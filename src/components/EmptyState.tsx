import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  message: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, message, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-20', className)}>
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      {title && <h3 className="text-xl font-semibold text-secondary mb-2">{title}</h3>}
      <p className="text-muted text-lg">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

