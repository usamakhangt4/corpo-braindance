'use client'

import { useState, useCallback } from 'react'
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { useAuth } from './use-auth'
import type { BuzzwordEntry } from '@/lib/types/buzzword'
import type { VoteAction } from '@/lib/types/buzzword'

interface UseVotingReturn {
  entries: BuzzwordEntry[]
  loading: boolean
  votingIds: Set<number>
  fetchTopPhrases: () => Promise<void>
  handleVote: (id: number, action: VoteAction) => Promise<void>
  requiresAuth: boolean
}

const TOP_PHRASES_LIMIT = 10

export function useVoting(): UseVotingReturn {
  const { user } = useAuth()
  const [entries, setEntries] = useState<BuzzwordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [votingIds, setVotingIds] = useState<Set<number>>(new Set())

  const fetchTopPhrases = useCallback(async () => {
    try {
      const data = await BuzzwordService.getTopBuzzwords(TOP_PHRASES_LIMIT)
      setEntries(data)
    } catch (error) {
      console.error('Error fetching phrases:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleVote = useCallback(
    async (id: number, action: VoteAction) => {
      if (!user) {
        // Return early - component should show auth modal
        return
      }

      if (votingIds.has(id)) return // Prevent double voting

      setVotingIds((prev) => new Set(prev).add(id))

      // Get current entry for optimistic update
      const currentEntry = entries.find((e) => e.id === id)
      if (!currentEntry) return

      const newUpvotes = action === 'promote' ? currentEntry.upvotes + 1 : Math.max(0, currentEntry.upvotes - 1)

      // Optimistic update
      setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, upvotes: newUpvotes } : entry)))

      try {
        await BuzzwordService.updateUpvotes(id, newUpvotes)

        // Re-fetch to ensure correct ordering (top 10 might have changed)
        await fetchTopPhrases()
      } catch (error) {
        console.error('Error voting:', error)
        // Revert optimistic update
        await fetchTopPhrases()
      } finally {
        setVotingIds((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    },
    [entries, votingIds, fetchTopPhrases, user],
  )

  return {
    entries,
    loading,
    votingIds,
    fetchTopPhrases,
    handleVote,
    requiresAuth: !user,
  }
}
