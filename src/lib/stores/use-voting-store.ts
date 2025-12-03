'use client'

import { create } from 'zustand'
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import type { BuzzwordEntry } from '@/lib/types/buzzword'
import type { VoteAction } from '@/lib/types/buzzword'
import { useAuthStore } from './use-auth-store'
import { GetAllBuzzwordsOptions } from '../db/buzzword-db'

interface VotingStore {
  // State
  entries: BuzzwordEntry[]
  loading: boolean
  votingIds: Set<number>
  error: string | null

  // Actions
  setEntries: (entries: BuzzwordEntry[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addVotingId: (id: number) => void
  removeVotingId: (id: number) => void

  // Async actions
  fetchTopPhrases: (limit?: number) => Promise<void>
  fetchAllPhrases: (options?: { sortBy?: string; limit?: number }) => Promise<void>
  handleVote: (id: number, action: VoteAction) => Promise<void>
  refreshEntries: () => Promise<void>
}

export const useVotingStore = create<VotingStore>((set, get) => ({
  // Initial state
  entries: [],
  loading: false,
  votingIds: new Set(),
  error: null,

  // Sync actions
  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addVotingId: (id) => set((state) => ({ votingIds: new Set(state.votingIds).add(id) })),
  removeVotingId: (id) =>
    set((state) => {
      const next = new Set(state.votingIds)
      next.delete(id)
      return { votingIds: next }
    }),

  // Async actions
  fetchTopPhrases: async (limit = HALL_OF_SHAME_LIMIT) => {
    set({ loading: true, error: null })
    try {
      const data = await BuzzwordService.getTopBuzzwords(limit)
      set({ entries: data, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch phrases',
        loading: false,
      })
    }
  },

  fetchAllPhrases: async (options = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await BuzzwordService.getAllBuzzwords(options as GetAllBuzzwordsOptions)
      set({ entries: data, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch phrases',
        loading: false,
      })
    }
  },

  handleVote: async (id: number, action: VoteAction) => {
    const { user } = useAuthStore.getState()
    if (!user) {
      set({ error: 'Authentication required' })
      return
    }

    const { entries, votingIds } = get()
    if (votingIds.has(id)) return

    get().addVotingId(id)

    const currentEntry = entries.find((e) => e.id === id)
    if (!currentEntry) {
      get().removeVotingId(id)
      return
    }

    const newUpvotes = action === 'promote' ? currentEntry.upvotes + 1 : Math.max(0, currentEntry.upvotes - 1)

    // Optimistic update
    set({
      entries: entries.map((entry) => (entry.id === id ? { ...entry, upvotes: newUpvotes } : entry)),
    })

    try {
      await BuzzwordService.updateUpvotes(id, newUpvotes)
      await get().fetchTopPhrases() // Refresh to get correct ordering
    } catch (error) {
      console.error('Error voting:', error)
      await get().fetchTopPhrases() // Revert on error
    } finally {
      get().removeVotingId(id)
    }
  },

  refreshEntries: async () => {
    await get().fetchTopPhrases()
  },
}))
