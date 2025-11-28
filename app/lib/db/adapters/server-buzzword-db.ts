/**
 * Supabase implementation of buzzword database adapter (Server-side)
 * For use in Server Components and API routes
 */

import { createClient } from '@/utils/supabase/server'
import type { IBuzzwordDb } from './buzzword-db'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export class ServerBuzzwordDb implements IBuzzwordDb {
  async getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('buzzwords')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as BuzzwordEntry[]
  }

  async createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>): Promise<BuzzwordEntry> {
    const supabase = await createClient()

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

    if (error) {
      console.error('Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        data: data,
      })
      throw error
    }
    return result as BuzzwordEntry
  }

  async updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('buzzwords').update({ upvotes }).eq('id', id).select().single()

    if (error) {
      // Handle case where no rows were updated
      if (error.code === 'PGRST116') {
        console.error(`Buzzword with id ${id} not found or cannot be updated`)
        throw new Error(`Buzzword with id ${id} not found`)
      }
      throw error
    }

    if (!data) {
      throw new Error(`Buzzword with id ${id} not found`)
    }

    return data as BuzzwordEntry
  }

  async getById(id: number): Promise<BuzzwordEntry | null> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('buzzwords').select('*').eq('id', id).single()

    if (error) return null
    return data as BuzzwordEntry
  }
}
