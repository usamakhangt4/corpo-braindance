'use client'

import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import type { VoteAction } from '@/lib/types/buzzword'

interface VotingControlsProps {
  votes: number
  userVote?: VoteAction | null
  onUpvote: () => void
  onDownvote: () => void
}

export function VotingControls({ votes, userVote, onUpvote, onDownvote }: VotingControlsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-base/60 p-1" aria-label="Local ranking controls">
      <button
        type="button"
        onClick={onUpvote}
        aria-label="Promote this phrase"
        aria-pressed={userVote === 'promote'}
        className={`rounded-md p-1.5 transition-[color,background-color,transform] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary ${
          userVote === 'promote' ? 'bg-status-success/20 text-status-success' : 'text-muted hover:text-status-success'
        }`}
      >
        <ArrowBigUp aria-hidden="true" className="h-5 w-5" fill={userVote === 'promote' ? 'currentColor' : 'none'} />
      </button>
      <span className="min-w-8 text-center font-mono text-sm font-bold text-secondary" aria-label={`${votes} local ranking points`}>
        {votes}
      </span>
      <button
        type="button"
        onClick={onDownvote}
        aria-label="Fire this phrase"
        aria-pressed={userVote === 'fire'}
        className={`rounded-md p-1.5 transition-[color,background-color,transform] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary ${
          userVote === 'fire' ? 'bg-status-error/20 text-status-error' : 'text-muted hover:text-status-error'
        }`}
      >
        <ArrowBigDown aria-hidden="true" className="h-5 w-5" fill={userVote === 'fire' ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
