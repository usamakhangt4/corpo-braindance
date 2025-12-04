/**
 * Unified buzzword database adapter
 * Works in both client and server contexts
 */

import { getSupabaseClient } from '@/lib/supabase/client'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export type SortOption = 'newest' | 'oldest' | 'most_upvotes' | 'least_upvotes'

export interface GetAllBuzzwordsOptions {
  limit?: number
  offset?: number
  sortBy?: SortOption
}

export interface IBuzzwordDb {
  getTopBuzzwords(limit: number, userId?: string | null): Promise<BuzzwordEntry[]>
  getAllBuzzwords(options?: GetAllBuzzwordsOptions & { userId?: string | null }): Promise<BuzzwordEntry[]>
  createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes' | 'user_id'> & { user_id: string }): Promise<BuzzwordEntry>
  updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry>
  getById(id: number, userId?: string | null): Promise<BuzzwordEntry | null>
  voteBuzzword(buzzwordId: number, userId: string, voteType: 'upvote' | 'downvote'): Promise<void>
  getUserVote(buzzwordId: number, userId: string): Promise<'upvote' | 'downvote' | null>
}

class BuzzwordDb implements IBuzzwordDb {
  async getTopBuzzwords(limit: number, userId?: string | null): Promise<BuzzwordEntry[]> {
    const supabase = await getSupabaseClient()
    
    // Fetch buzzwords
    const { data, error } = await supabase
      .from('buzzwords')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) {
      // Log detailed error for debugging
      console.error('Supabase error in getTopBuzzwords:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    const entries = (data || []) as BuzzwordEntry[]

    // If user is authenticated, fetch their votes
    if (userId) {
      const buzzwordIds = entries.map((e) => e.id)
      const { data: votes } = await supabase
        .from('buzzword_votes')
        .select('buzzword_id, vote_type')
        .eq('user_id', userId)
        .in('buzzword_id', buzzwordIds)

      // Map votes to entries
      const voteMap = new Map<number, 'upvote' | 'downvote'>()
      votes?.forEach((vote) => {
        voteMap.set(vote.buzzword_id, vote.vote_type as 'upvote' | 'downvote')
      })

      // Add user_vote to each entry
      return entries.map((entry) => ({
        ...entry,
        user_vote: voteMap.get(entry.id) || null,
      }))
    }

    return entries
  }

  async getAllBuzzwords(options: GetAllBuzzwordsOptions & { userId?: string | null } = {}): Promise<BuzzwordEntry[]> {
    const { limit = 50, offset = 0, sortBy = 'newest', userId } = options
    const supabase = await getSupabaseClient()

    let query = supabase.from('buzzwords').select('*')

    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'most_upvotes':
        query = query.order('upvotes', { ascending: false })
        break
      case 'least_upvotes':
        query = query.order('upvotes', { ascending: true })
        break
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) throw error

    const entries = (data || []) as BuzzwordEntry[]

    // If user is authenticated, fetch their votes
    if (userId) {
      const buzzwordIds = entries.map((e) => e.id)
      if (buzzwordIds.length > 0) {
        const { data: votes } = await supabase
          .from('buzzword_votes')
          .select('buzzword_id, vote_type')
          .eq('user_id', userId)
          .in('buzzword_id', buzzwordIds)

        // Map votes to entries
        const voteMap = new Map<number, 'upvote' | 'downvote'>()
        votes?.forEach((vote) => {
          voteMap.set(vote.buzzword_id, vote.vote_type as 'upvote' | 'downvote')
        })

        // Add user_vote to each entry
        return entries.map((entry) => ({
          ...entry,
          user_vote: voteMap.get(entry.id) || null,
        }))
      }
    }

    return entries
  }

  async createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes' | 'user_id'> & { user_id: string }): Promise<BuzzwordEntry> {
    const supabase = await getSupabaseClient()
    const { data: result, error } = await supabase
      .from('buzzwords')
      .insert({
        phrase: data.phrase,
        meaning: data.meaning,
        department: data.department,
        synergy_score: data.synergy_score,
        user_id: data.user_id,
      })
      .select()
      .single()

    if (error) throw error
    return result as BuzzwordEntry
  }

  async updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('buzzwords').update({ upvotes }).eq('id', id).select().single()

    if (error) throw error
    if (!data) throw new Error(`Buzzword with id ${id} not found`)
    return data as BuzzwordEntry
  }

  async getById(id: number, userId?: string | null): Promise<BuzzwordEntry | null> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('buzzwords').select('*').eq('id', id).single()
    if (error) return null

    const entry = data as BuzzwordEntry

    // If user is authenticated, fetch their vote
    if (userId) {
      const { data: vote } = await supabase
        .from('buzzword_votes')
        .select('vote_type')
        .eq('buzzword_id', id)
        .eq('user_id', userId)
        .maybeSingle()

      return {
        ...entry,
        user_vote: (vote?.vote_type as 'upvote' | 'downvote') || null,
      }
    }

    return entry
  }

  async voteBuzzword(buzzwordId: number, userId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
    const supabase = await getSupabaseClient()

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('buzzword_votes')
      .select('vote_type')
      .eq('buzzword_id', buzzwordId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Same vote - remove it (unvote)
        const { error } = await supabase
          .from('buzzword_votes')
          .delete()
          .eq('buzzword_id', buzzwordId)
          .eq('user_id', userId)

        if (error) throw error
      } else {
        // Different vote - update it
        const { error } = await supabase
          .from('buzzword_votes')
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq('buzzword_id', buzzwordId)
          .eq('user_id', userId)

        if (error) throw error
      }
    } else {
      // No existing vote - insert new vote
      const { error } = await supabase.from('buzzword_votes').insert({
        buzzword_id: buzzwordId,
        user_id: userId,
        vote_type: voteType,
      })

      if (error) throw error
    }
  }

  async getUserVote(buzzwordId: number, userId: string): Promise<'upvote' | 'downvote' | null> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('buzzword_votes')
      .select('vote_type')
      .eq('buzzword_id', buzzwordId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return null
    return (data.vote_type as 'upvote' | 'downvote') || null
  }
}

// Export singleton instance
export const buzzwordDb = new BuzzwordDb()
