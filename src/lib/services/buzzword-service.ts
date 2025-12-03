/**
 * Unified buzzword service
 * Works in both Server Components and Client Components
 *
 * Server Components: Use directly
 * Client Components: Use via Zustand stores
 */

import { buzzwordDb } from '@/lib/db/buzzword-db'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import type { BuzzwordData } from '@/lib/types/buzzword'
import type { BuzzwordEntry } from '@/lib/types/buzzword'
import type { GetAllBuzzwordsOptions } from '@/lib/db/buzzword-db'

export class BuzzwordService {
  /**
   * Submit a buzzword
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
   * @param limit - Maximum number of results (default: HALL_OF_SHAME_LIMIT)
   */
  static async getTopBuzzwords(limit: number = HALL_OF_SHAME_LIMIT): Promise<BuzzwordEntry[]> {
    return await buzzwordDb.getTopBuzzwords(limit)
  }

  /**
   * Get all buzzwords with pagination and sorting
   */
  static async getAllBuzzwords(options?: GetAllBuzzwordsOptions): Promise<BuzzwordEntry[]> {
    return await buzzwordDb.getAllBuzzwords(options)
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
