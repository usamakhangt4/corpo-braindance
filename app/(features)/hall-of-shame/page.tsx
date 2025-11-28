'use client'

import { useEffect, useState } from 'react'
import { useVoting } from '@/hooks/use-voting'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { VoteAction } from '@/lib/types/buzzword'
import { AuthModal } from '@/components/auth-modal'

export default function HallOfShame() {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const { entries, loading, votingIds, fetchTopPhrases, handleVote, requiresAuth } = useVoting()

  useEffect(() => {
    fetchTopPhrases()
  }, [fetchTopPhrases])

  const handleVoteClick = (id: number, action: VoteAction) => {
    if (requiresAuth) {
      setAuthModalOpen(true)
      return
    }
    handleVote(id, action)
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-4 md:p-8">
        {/* Header */}
        <header className="w-full max-w-4xl text-center mb-10 mt-8">
          <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
            HALL // OF SHAME
          </h1>
          <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase mb-2">Performance Review Portal</p>
          <p className="text-slate-400 text-lg">Top 10 Most Cringeworthy Phrases Ranked by Upvotes</p>
        </header>

        {/* Rankings List */}
        <div className="w-full max-w-4xl space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              {/* Loading Animation */}
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div
                  className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              {/* Loading Message */}
              <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase">Loading Performance Reviews...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No entries yet. Be the first to submit to HR!</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl overflow-hidden transition-all hover:border-cyan-500/50 group"
              >
                {/* Background Gradient Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                        index === 0
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                          : index === 1
                          ? 'bg-slate-600/20 border-slate-400 text-slate-300'
                          : index === 2
                          ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                          : 'bg-slate-700/20 border-slate-600 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] border border-indigo-500/30 px-3 py-1 rounded-full">
                      {entry.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Synergy:</span>
                    <span
                      className={`text-lg font-bold ${entry.synergy_score > 90 ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                      {entry.synergy_score}%
                    </span>
                  </div>
                </div>

                {/* Phrase */}
                <h2 className="text-2xl md:text-3xl font-serif font-medium text-slate-100 leading-tight mb-3">
                  "{entry.phrase}"
                </h2>

                {/* Meaning */}
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 backdrop-blur-sm mb-4">
                  <p className="text-slate-400 font-mono text-sm leading-relaxed">
                    <span className="text-indigo-400 font-bold mr-2">&gt;</span>
                    {entry.meaning}
                  </p>
                </div>

                {/* Voting Section */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-col md:flex-row gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase font-semibold">Performance Review:</span>
                    <span className="text-cyan-400 font-bold text-lg">{entry.upvotes}</span>
                    <span className="text-xs text-slate-500">upvotes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVoteClick(entry.id, 'promote')}
                      disabled={votingIds.has(entry.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Promote
                    </button>
                    <button
                      onClick={() => handleVoteClick(entry.id, 'fire')}
                      disabled={votingIds.has(entry.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Fire
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
        mode="login"
        title="Sign in to Vote"
        description="You need to be authenticated to vote on buzzwords"
        onSuccess={() => {
          // Retry the vote after successful login
          // You might want to store the pending vote action
        }}
      />
    </>
  )
}
