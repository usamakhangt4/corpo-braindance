'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { BuzzwordEntry } from '@/lib/types/buzzword'
import type { VoteAction } from '@/lib/types/buzzword'

interface UseVotingReturn {
  entries: BuzzwordEntry[]
  loading: boolean
  votingIds: Set<number>
  fetchTopPhrases: () => Promise<void>
  handleVote: (id: number, action: VoteAction) => Promise<void>
}

const TOP_PHRASES_LIMIT = 10

export function useVoting(): UseVotingReturn {
  const [entries, setEntries] = useState<BuzzwordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [votingIds, setVotingIds] = useState<Set<number>>(new Set())

  const fetchTopPhrases = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('buzzwords')
        .select('*')
        .order('upvotes', { ascending: false })
        .limit(TOP_PHRASES_LIMIT)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching phrases:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleVote = useCallback(
    async (id: number, action: VoteAction) => {
      if (votingIds.has(id)) return // Prevent double voting

      setVotingIds((prev) => new Set(prev).add(id))

      // Get current entry for optimistic update
      const currentEntry = entries.find((e) => e.id === id)
      if (!currentEntry) return

      const newUpvotes = action === 'promote' ? currentEntry.upvotes + 1 : Math.max(0, currentEntry.upvotes - 1)

      // Optimistic update
      setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, upvotes: newUpvotes } : entry)))

      try {
        const { error } = await supabase.from('buzzwords').update({ upvotes: newUpvotes }).eq('id', id)

        if (error) {
          // Revert on error
          await fetchTopPhrases()
          throw error
        }

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
    [entries, votingIds, fetchTopPhrases]
  )

  return {
    entries,
    loading,
    votingIds,
    fetchTopPhrases,
    handleVote,
  }
}

