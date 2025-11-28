/**
 * Database adapter interface for buzzword operations
 * This interface abstracts database access, allowing easy swapping of implementations
 */

import type { BuzzwordEntry } from '@/lib/types/buzzword'

export interface IBuzzwordDb {
  /**
   * Get top buzzwords ordered by upvotes
   * @param limit - Maximum number of results to return
   * @returns Array of buzzword entries
   */
  getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]>

  /**
   * Create a new buzzword entry
   * @param data - Buzzword data (without id, created_at, upvotes)
   * @returns Created buzzword entry
   */
  createBuzzword(
    data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>
  ): Promise<BuzzwordEntry>

  /**
   * Update upvotes for a buzzword
   * @param id - Buzzword ID
   * @param upvotes - New upvote count
   * @returns Updated buzzword entry
   */
  updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry>

  /**
   * Get buzzword by ID
   * @param id - Buzzword ID
   * @returns Buzzword entry or null if not found
   */
  getById(id: number): Promise<BuzzwordEntry | null>
}

