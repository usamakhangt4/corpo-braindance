/**
 * Type definitions for buzzword-related data structures
 */

export interface BuzzwordEntry {
  id: number
  phrase: string
  meaning: string
  department: string
  synergy_score: number
  upvotes: number
  user_id: string | null
  created_at: string
  user_vote?: 'upvote' | 'downvote' | null // Current user's vote on this buzzword
}

export interface BuzzwordData {
  phrase: string
  fullSentence: string
  role: string
  score: number
}

export type BuzzwordRole = 'ceo' | 'sales' | 'tech'

export type VoteAction = 'promote' | 'fire'
