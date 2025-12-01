/**
 * Buzzword service layer (Client-side)
 * Provides business logic for Client Components
 *
 * For Server Components, use @/lib/services/server-buzzword-service
 */

import { buzzwordDb } from '@/lib/db/client'
import type { BuzzwordData } from '@/lib/types/buzzword'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export class BuzzwordService {
  /**
   * Submit a buzzword (Client-side)
   * For use in Client Components
   */
  static async submitBuzzword(data: BuzzwordData): Promise<BuzzwordEntry> {
    return await buzzwordDb.createBuzzword({
      phrase: data.phrase,
      meaning: data.fullSentence,
      department: data.role,
      synergy_score: data.score,
    })
  }

  /**
   * Get top buzzwords by upvotes
   * @param limit - Maximum number of results (default: 10)
   */
  static async getTopBuzzwords(limit: number = 10): Promise<BuzzwordEntry[]> {
    return await buzzwordDb.getTopBuzzwords(limit)
  }

  /**
   * Update upvotes for a buzzword
   */
  static async updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry> {
    return await buzzwordDb.updateUpvotes(id, upvotes)
  }

  /**
   * Get buzzword by ID
   */
  static async getById(id: number): Promise<BuzzwordEntry | null> {
    return await buzzwordDb.getById(id)
  }
}
