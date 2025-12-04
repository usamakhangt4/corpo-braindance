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
        onClick={onUpvote}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center justify-center p-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-overlay',
          isUpvoted ? 'text-orange-500' : 'text-muted hover:text-orange-500',
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={cn('w-5 h-5', isUpvoted && 'fill-current')} />
      </button>

      {/* Vote Count */}
      <div
        className={cn(
          'min-w-[2rem] text-center font-bold text-sm px-1',
          isUpvoted ? 'text-orange-500' : isDownvoted ? 'text-blue-500' : 'text-primary',
        )}
      >
        {upvotes}
      </div>

      {/* Downvote Button */}
      <button
        onClick={onDownvote}
        disabled={disabled || isLoading}
        className={cn(
          'flex items-center justify-center p-1 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-overlay',
          isDownvoted ? 'text-blue-500' : 'text-muted hover:text-blue-500',
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={cn('w-5 h-5', isDownvoted && 'fill-current')} />
      </button>
    </div>
  )
}

