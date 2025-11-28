/**
 * Buzzword service layer (Server-side)
 * Provides business logic for Server Components and API routes
 * 
 * ⚠️ DO NOT import this in Client Components
 * For Client Components, use @/lib/services/buzzword-service
 */

import { getServerBuzzwordDb } from '@/lib/db/server'
import type { BuzzwordData } from '@/lib/types/buzzword'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export class ServerBuzzwordService {
  /**
   * Submit a buzzword (Server-side)
   * For use in Server Components and API routes
   */
  static async submitBuzzword(data: BuzzwordData): Promise<BuzzwordEntry> {
    const db = getServerBuzzwordDb()
    return await db.createBuzzword({
      phrase: data.phrase,
      meaning: data.fullSentence,
      department: data.role,
      synergy_score: data.score,
    })
  }

  /**
   * Get top buzzwords (Server-side)
   * For use in Server Components
   */
  static async getTopBuzzwords(limit: number = 10): Promise<BuzzwordEntry[]> {
    const db = getServerBuzzwordDb()
    return await db.getTopBuzzwords(limit)
  }

  /**
   * Update upvotes for a buzzword (Server-side)
   */
  static async updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry> {
    const db = getServerBuzzwordDb()
    return await db.updateUpvotes(id, upvotes)
  }

  /**
   * Get buzzword by ID (Server-side)
   */
  static async getById(id: number): Promise<BuzzwordEntry | null> {
    const db = getServerBuzzwordDb()
    return await db.getById(id)
  }
}

