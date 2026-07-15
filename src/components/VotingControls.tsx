import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VotingControlsProps {
  upvotes: number
  userVote?: 'upvote' | 'downvote' | null
  onUpvote: () => void
  onDownvote: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

export function VotingControls({
  upvotes,
  userVote,
  onUpvote,
  onDownvote,
  disabled = false,
  isLoading = false,
  className,
}: VotingControlsProps) {
  const isUpvoted = userVote === 'upvote'
  const isDownvoted = userVote === 'downvote'

  return (
    <div className={cn('flex items-center gap-1 bg-surface-overlay/30 rounded px-2 py-1 border border-base/50', className)}>
      {/* Upvote Button */}
      <button
        type="button"
        onClick={onUpvote}
        disabled={disabled || isLoading}
        aria-pressed={isUpvoted}
        aria-busy={isLoading}
        className={cn(
          'flex min-h-8 min-w-8 items-center justify-center rounded p-1 transition-[color,background-color,opacity] hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary disabled:cursor-not-allowed disabled:opacity-50',
          isUpvoted ? 'text-orange-500' : 'text-muted hover:text-orange-500',
        )}
        aria-label="Upvote"
      >
        <ChevronUp aria-hidden="true" className={cn('w-5 h-5', isUpvoted && 'fill-current')} />
      </button>

      {/* Vote Count */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'min-w-[2rem] text-center font-bold text-sm px-1',
          isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : 'text-primary',
        )}
      >
        {upvotes}
      </div>

      {/* Downvote Button */}
      <button
        type="button"
        onClick={onDownvote}
        disabled={disabled || isLoading}
        aria-pressed={isDownvoted}
        aria-busy={isLoading}
        className={cn(
          'flex min-h-8 min-w-8 items-center justify-center rounded p-1 transition-[color,background-color,opacity] hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary disabled:cursor-not-allowed disabled:opacity-50',
          isDownvoted ? 'text-blue-500' : 'text-muted hover:text-blue-500',
        )}
        aria-label="Downvote"
      >
        <ChevronDown aria-hidden="true" className={cn('w-5 h-5', isDownvoted && 'fill-current')} />
      </button>
    </div>
  )
}

