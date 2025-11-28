/**
 * Supabase implementation of buzzword database adapter (Client-side)
 * For use in Client Components
 */

import { supabase } from '@/lib/supabaseClient'
import type { IBuzzwordDb } from './buzzword-db'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export class SupabaseBuzzwordDb implements IBuzzwordDb {
  async getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]> {
    const { data, error } = await supabase
      .from('buzzwords')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as BuzzwordEntry[]
  }

  async createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>): Promise<BuzzwordEntry> {
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
    const { data, error } = await supabase.from('buzzwords').update({ upvotes }).eq('id', id).select().single()

    if (error) throw error
    return data as BuzzwordEntry
  }

  async getById(id: number): Promise<BuzzwordEntry | null> {
    const { data, error } = await supabase.from('buzzwords').select('*').eq('id', id).single()

    if (error) return null
    return data as BuzzwordEntry
  }
}
