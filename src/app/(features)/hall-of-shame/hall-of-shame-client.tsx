'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useVotingStore } from '@/lib/stores/use-voting-store'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { useTopBuzzwords, useVoteBuzzword } from '@/hooks/use-buzzwords'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import { MessageSquare, Share2 } from 'lucide-react'
import type { VoteAction, BuzzwordEntry } from '@/lib/types/buzzword'
import { AuthModal } from '@/components/auth-modal'
import { useQueryClient } from '@tanstack/react-query'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'
import { EmptyState } from '@/components/EmptyState'
import { VotingControls } from '@/components/VotingControls'

interface HallOfShameClientProps {
  initialEntries: BuzzwordEntry[]
}

export function HallOfShameClient({ initialEntries }: HallOfShameClientProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // React Query for data fetching
  const { user } = useAuthStore()
  const { data: entries = initialEntries, isLoading: loading, error } = useTopBuzzwords(HALL_OF_SHAME_LIMIT, user?.id ?? null)
  const voteBuzzword = useVoteBuzzword()
  const queryClient = useQueryClient()

  // Zustand for UI state only
  const { addVotingId, removeVotingId, isVoting } = useVotingStore()

  const handleVoteClick = async (id: number, action: VoteAction) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    if (isVoting(id)) return

    const currentEntry = entries.find((e) => e.id === id)
    if (!currentEntry) return

    addVotingId(id)

    try {
      await toast.promise(
        voteBuzzword.mutateAsync({
          buzzwordId: id,
          userId: user.id,
          voteType: action === 'promote' ? 'upvote' : 'downvote',
        }),
        {
          loading: action === 'promote' ? 'Promoting buzzword…' : 'Firing buzzword…',
          success: action === 'promote' ? 'Vote recorded successfully!' : 'Vote recorded successfully!',
          error: (error) => {
            // If authentication error, show auth modal
            if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('401'))) {
              setAuthModalOpen(true)
              return 'Authentication required'
            }
            return 'Failed to vote. Please try again.'
          },
        },
      )
    } catch (error) {
      // Error is already handled by toast.promise
      console.error('Error voting:', error)
    } finally {
      removeVotingId(id)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-surface-base text-primary font-sans flex flex-col items-center p-4 md:p-8">
        {/* Header */}
        <header className="w-full max-w-4xl text-center mb-10 mt-8">
          <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
            HALL // OF SHAME
          </h1>
          <p className="text-neural-primary-dark font-mono text-xs tracking-[0.5em] uppercase mb-2">Performance Review Portal</p>
          <p className="text-muted text-lg">Top 10 Most Cringeworthy Phrases Ranked by Upvotes</p>
        </header>

        {/* Rankings List */}
        <div className="w-full max-w-4xl space-y-4">
          {loading ? (
            <LoadingSpinner message="Loading Performance Reviews..." className="py-20" />
          ) : error ? (
            <ErrorMessage
              message={error instanceof Error ? error.message : 'An unknown error occurred'}
              variant="destructive"
              className="py-20"
            />
          ) : entries.length === 0 ? (
            <EmptyState message="No entries yet. Be the first to submit to HR!" />
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="relative bg-surface-elevated border border-base rounded-2xl p-6 shadow-xl overflow-hidden transition-[border-color] hover:border-neural-primary/50 group"
              >
                {/* Background Gradient Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                        index === 0
                          ? 'bg-status-warning/20 border-status-warning text-status-warning'
                          : index === 1
                          ? 'bg-surface-overlay/20 border-secondary text-secondary'
                          : index === 2
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-surface-overlay/20 border-elevated text-muted'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] border border-indigo-500/30 px-3 py-1 rounded-full">
                      {entry.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted uppercase font-semibold">Synergy:</span>
                    <span
                      className={`text-lg font-bold ${entry.synergy_score > 90 ? 'text-status-success' : 'text-status-warning'}`}
                    >
                      {entry.synergy_score}%
                    </span>
                  </div>
                </div>

                {/* Phrase */}
                <h2 className="text-2xl md:text-3xl font-serif font-medium text-primary leading-tight mb-3">
                  “{entry.phrase}”
                </h2>

                {/* Meaning */}
                <div className="bg-surface-base/50 rounded-xl p-4 border border-elevated/50 backdrop-blur-sm mb-4">
                  <p className="text-muted font-mono text-sm leading-relaxed">
                    <span className="text-indigo-400 font-bold mr-2">&gt;</span>
                    {entry.meaning}
                  </p>
                </div>

                {/* Voting Section - Reddit Style Horizontal */}
                <div className="flex items-center justify-between pt-3 border-t border-elevated">
                  {/* Left side - Voting controls */}
                  <VotingControls
                    upvotes={entry.upvotes}
                    userVote={entry.user_vote}
                    onUpvote={() => handleVoteClick(entry.id, 'promote')}
                    onDownvote={() => handleVoteClick(entry.id, 'fire')}
                    disabled={isVoting(entry.id)}
                    isLoading={voteBuzzword.isPending}
                  />

                  {/* Right side - Reply and Share buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-muted hover:bg-surface-overlay transition-[color,background-color,opacity] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      aria-label="Reply"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-muted hover:bg-surface-overlay transition-[color,background-color,opacity] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      aria-label="Share"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* modals */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={mode}
        onSuccess={() => {
          setMode('login')
          // Only refetch active queries to avoid rate limiting
          queryClient.invalidateQueries({ queryKey: ['buzzwords'], refetchType: 'active' })
        }}
        title={mode === 'login' ? 'Sign in to Vote' : 'Sign up to Vote'}
        description="You need to be authenticated to vote on buzzwords"
      />
    </>
  )
}
