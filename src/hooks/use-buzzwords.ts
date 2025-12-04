'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buzzwordDb } from '@/lib/db/buzzword-db'
import { getSupabaseClient } from '@/lib/supabase/client'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import type { GetAllBuzzwordsOptions } from '@/lib/db/buzzword-db'
import type { BuzzwordEntry, BuzzwordData } from '@/lib/types/buzzword'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * React Query hooks for buzzword data fetching
 * Replaces manual fetching in Zustand stores
 */

// Query keys
export const buzzwordKeys = {
  all: ['buzzwords'] as const,
  top: (limit?: number) => [...buzzwordKeys.all, 'top', limit] as const,
  allPhrases: (options?: GetAllBuzzwordsOptions) => [...buzzwordKeys.all, 'all', options] as const,
  byId: (id: number) => [...buzzwordKeys.all, id] as const,
}

/**
 * Hook to fetch top buzzwords
 * With Realtime enabled, we rely on subscriptions for updates, so we can cache longer
 */
export function useTopBuzzwords(limit: number = HALL_OF_SHAME_LIMIT, userId?: string | null) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [...buzzwordKeys.top(limit), userId],
    queryFn: () => buzzwordDb.getTopBuzzwords(limit, userId),
    staleTime: Infinity, // With Realtime, data stays fresh via subscriptions
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer since Realtime handles updates
    refetchOnWindowFocus: false, // Realtime handles updates, no need to refetch
    refetchOnMount: false, // Realtime handles updates
    refetchOnReconnect: true, // Only refetch on reconnect (connection lost)
    refetchInterval: false, // No polling needed with Realtime
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Set up Realtime subscription for updates
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!query.data) return

    let isMounted = true

    const setupSubscription = async () => {
      const supabase = await getSupabaseClient()
      const channel = supabase
        .channel(`buzzwords-changes-${limit}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'buzzwords',
          },
          async () => {
            // When changes occur, refetch the top buzzwords to get updated ordering
            if (isMounted) {
              await queryClient.invalidateQueries({ queryKey: buzzwordKeys.top(limit), refetchType: 'active' })
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'buzzword_votes',
          },
          async () => {
            // When votes change, refetch to get updated vote counts and user_vote
            if (isMounted) {
              await queryClient.invalidateQueries({ queryKey: buzzwordKeys.top(limit), refetchType: 'active' })
            }
          },
        )
        .subscribe()

      if (isMounted) {
        channelRef.current = channel
      } else {
        // Component unmounted before subscription was set up, clean up immediately
        channel.unsubscribe()
      }
    }

    setupSubscription()

    return () => {
      isMounted = false
      const channel = channelRef.current
      if (channel) {
        try {
          channel.unsubscribe()
        } catch (error) {
          console.error('Error unsubscribing from Realtime channel:', error)
        }
        channelRef.current = null
      }
    }
  }, [query.data, queryClient, limit])

  return query
}

/**
 * Hook to fetch all buzzwords with options
 * With Realtime enabled, we rely on subscriptions for updates
 */
export function useAllBuzzwords(options?: GetAllBuzzwordsOptions) {
  return useQuery({
    queryKey: buzzwordKeys.allPhrases(options),
    queryFn: () => buzzwordDb.getAllBuzzwords(options),
    staleTime: Infinity, // With Realtime, data stays fresh via subscriptions
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true, // Only refetch on reconnect
    refetchInterval: false, // No polling needed with Realtime
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch a single buzzword by ID
 */
export function useBuzzwordById(id: number) {
  return useQuery({
    queryKey: buzzwordKeys.byId(id),
    queryFn: () => buzzwordDb.getById(id),
    enabled: !!id,
  })
}

/**
 * Hook to vote on a buzzword (upvote or downvote)
 * Handles vote logic: insert, update, or remove vote
 */
export function useVoteBuzzword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ buzzwordId, userId, voteType }: { buzzwordId: number; userId: string; voteType: 'upvote' | 'downvote' }) =>
      buzzwordDb.voteBuzzword(buzzwordId, userId, voteType),
    onSuccess: () => {
      // Invalidate queries to refetch with updated vote counts and user_vote
      queryClient.invalidateQueries({ queryKey: buzzwordKeys.all, refetchType: 'active' })
    },
    onError: (error) => {
      // Error toast is handled in the component using toast.promise
      console.error('Vote error:', error)
    },
  })
}

/**
 * Hook to update upvotes with optimistic updates
 * @deprecated Use useVoteBuzzword instead for proper vote tracking
 */
export function useUpdateUpvotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, upvotes }: { id: number; upvotes: number }) => buzzwordDb.updateUpvotes(id, upvotes),
    onMutate: async ({ id, upvotes }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: buzzwordKeys.all })

      // Snapshot previous values - check all possible query keys
      const previousTop = queryClient.getQueryData<BuzzwordEntry[]>(buzzwordKeys.top())
      const previousAll = queryClient.getQueryData<BuzzwordEntry[]>(buzzwordKeys.allPhrases())

      // Optimistically update all relevant queries
      if (previousTop) {
        queryClient.setQueryData<BuzzwordEntry[]>(
          buzzwordKeys.top(),
          previousTop.map((entry) => (entry.id === id ? { ...entry, upvotes } : entry)),
        )
      }

      if (previousAll) {
        queryClient.setQueryData<BuzzwordEntry[]>(
          buzzwordKeys.allPhrases(),
          previousAll.map((entry) => (entry.id === id ? { ...entry, upvotes } : entry)),
        )
      }

      return { previousTop, previousAll }
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTop) {
        queryClient.setQueryData(buzzwordKeys.top(), context.previousTop)
      }
      if (context?.previousAll) {
        queryClient.setQueryData(buzzwordKeys.allPhrases(), context.previousAll)
      }
    },
    onSuccess: () => {
      // Invalidate to refetch and get correct ordering
      // Use refetchType: 'active' to only refetch active queries, not all
      queryClient.invalidateQueries({ queryKey: buzzwordKeys.all, refetchType: 'active' })
    },
  })
}

/**
 * Hook to submit a new buzzword
 * Uses Server Action which handles authentication and user_id automatically
 */
export function useSubmitBuzzword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BuzzwordData) => {
      const { submitBuzzwordAction } = await import('@/app/actions/buzzword')
      return await submitBuzzwordAction(data)
    },
    onSuccess: () => {
      // Invalidate queries to refetch with new data
      // Use refetchType: 'active' to only refetch active queries
      queryClient.invalidateQueries({ queryKey: buzzwordKeys.all, refetchType: 'active' })
    },
    onError: (error) => {
      // Error toast is handled in the component using toast.promise
      console.error('Submit buzzword error:', error)
    },
  })
}
