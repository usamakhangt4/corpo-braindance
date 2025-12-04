'use client'

import { create } from 'zustand'
import type { VoteAction } from '@/lib/types/buzzword'

/**
 * Voting Store - UI state only
 * Data fetching is handled by React Query hooks (use-buzzwords.ts)
 * This store only manages UI state like preventing double-clicks
 */
interface VotingStore {
  // UI State only
  votingIds: Set<number>

  // Actions
  addVotingId: (id: number) => void
  removeVotingId: (id: number) => void
  isVoting: (id: number) => boolean
}

export const useVotingStore = create<VotingStore>((set, get) => ({
  // Initial state
  votingIds: new Set(),

  // Actions
  addVotingId: (id) => set((state) => ({ votingIds: new Set(state.votingIds).add(id) })),
  removeVotingId: (id) =>
    set((state) => {
      const next = new Set(state.votingIds)
      next.delete(id)
      return { votingIds: next }
    }),
  isVoting: (id) => get().votingIds.has(id),
}))
