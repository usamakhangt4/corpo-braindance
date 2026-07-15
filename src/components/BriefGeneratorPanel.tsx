import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BriefGeneratorPanelProps {
  children: ReactNode
  className?: string
  animate?: boolean
}

export function BriefGeneratorPanel({ children, className, animate = false }: BriefGeneratorPanelProps) {
  return (
    <div className="brief-panel-shell">
      <div aria-hidden="true" className="brief-panel-rail">
        <span>CB-77</span>
        <span>MEMO OUTPUT</span>
      </div>
      <div
        data-transmitting={animate ? 'true' : 'false'}
        className={cn('brief-panel', animate && 'brief-panel--transmitting', className)}
      >
        <div aria-hidden="true" className="brief-panel-grid" />
        <div aria-hidden="true" className={cn('brief-panel-wipe', animate && 'brief-panel-wipe--active')} />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
