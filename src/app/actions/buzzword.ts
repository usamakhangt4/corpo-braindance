'use server'

import { BUZZWORD_DATA } from '@/lib/constants/buzzwords'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { validateBuzzwordSubmission } from '@/lib/validation/buzzword'
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
export async function submitBuzzwordAction(input: unknown): Promise<BuzzwordEntry> {
  const validation = validateBuzzwordSubmission(input)

  if (!validation.success) {
    throw new Error(validation.error)
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Authentication required. Please sign in to submit buzzwords.')
  }

  const { data, error } = await supabase
    .from('buzzwords')
    .insert({
      phrase: validation.data.phrase,
      meaning: validation.data.fullSentence,
      department: validation.data.role,
      synergy_score: validation.data.score,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error('Unable to submit the buzzword. Please try again.')
  }

  return data as BuzzwordEntry
}
