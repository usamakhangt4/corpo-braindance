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
  getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]>
  getAllBuzzwords(options?: GetAllBuzzwordsOptions): Promise<BuzzwordEntry[]>
  createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>): Promise<BuzzwordEntry>
  updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry>
  getById(id: number): Promise<BuzzwordEntry | null>
}

class BuzzwordDb implements IBuzzwordDb {
  async getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]> {
    const supabase = await getSupabaseClient()
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
    return (data || []) as BuzzwordEntry[]
  }

  async getAllBuzzwords(options: GetAllBuzzwordsOptions = {}): Promise<BuzzwordEntry[]> {
    const { limit = 50, offset = 0, sortBy = 'newest' } = options
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
    return (data || []) as BuzzwordEntry[]
  }

  async createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>): Promise<BuzzwordEntry> {
    const supabase = await getSupabaseClient()
    const { data: result, error } = await supabase
      .from('buzzwords')
      .insert({
        phrase: data.phrase,
        meaning: data.meaning,
        department: data.department,
        synergy_score: data.synergy_score,
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

  async getById(id: number): Promise<BuzzwordEntry | null> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('buzzwords').select('*').eq('id', id).single()
    if (error) return null
    return data as BuzzwordEntry
  }
}

// Export singleton instance
export const buzzwordDb = new BuzzwordDb()
