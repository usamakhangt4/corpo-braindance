'use server'

import { BUZZWORD_DATA } from '@/lib/constants/buzzwords'
import { buzzwordDb } from '@/lib/db/buzzword-db'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { BuzzwordData, BuzzwordRole, BuzzwordEntry } from '@/lib/types/buzzword'

type BuzzwordSource = (typeof BUZZWORD_DATA)[keyof typeof BUZZWORD_DATA]

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

const titleCase = (str: string): string =>
  str.replace(/\w\S*/g, (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())

/**
 * Server action to generate a buzzword
 * This keeps the generation logic hidden from the client
 */
export async function generateBuzzwordAction(role: BuzzwordRole = 'ceo'): Promise<BuzzwordData> {
  const source: BuzzwordSource = BUZZWORD_DATA[role] ?? BUZZWORD_DATA.ceo

  const adv = pick(source.adverbs)
  const verb = pick(source.verbs)
  const adj = pick(source.adjectives)
  const noun = pick(source.nouns)

  const phrase = titleCase(`${adv} ${verb} ${adj} ${noun}`)

  // Pick a random template and inject the phrase (lowercased for the middle of sentences)
  const sentenceTemplate = pick(source.templates)
  const fullSentence = sentenceTemplate(`${adv} ${verb} the ${adj} ${noun}`)

  return {
    phrase,
    fullSentence,
    role: role.toUpperCase(),
    score: Math.floor(Math.random() * 20) + 80, // Random score between 80-99
  }
}

/**
 * Server action to submit a buzzword to the database
 * This keeps database operations on the server
 * Requires authentication - only authenticated users can submit
 */
export async function submitBuzzwordAction(data: BuzzwordData): Promise<BuzzwordEntry> {
  // Check authentication - use getSession() for Server Actions (reads from cookies)
  const supabase = await getSupabaseClient()
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()

  if (authError || !session || !session.user) {
    console.error('Auth check failed:', { authError, hasSession: !!session })
    throw new Error('Authentication required. Please sign in to submit buzzwords.')
  }

  // User is authenticated, proceed with submission (include user_id)
  return await buzzwordDb.createBuzzword({
    phrase: data.phrase,
    meaning: data.fullSentence,
    department: data.role,
    synergy_score: data.score,
    user_id: session.user.id,
  })
}
