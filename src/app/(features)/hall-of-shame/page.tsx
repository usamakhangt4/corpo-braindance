// Server Component - NO 'use client'
import { getTopBuzzwordsForServer } from '@/lib/db/buzzword-server'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import { HallOfShameClient } from './hall-of-shame-client'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export const dynamic = 'force-dynamic'

export default async function HallOfShamePage() {
  // Fetch data on the server (fast, SEO-friendly)
  // Handle errors gracefully - if RLS blocks access, return empty array
  let initialEntries: BuzzwordEntry[] = []
  try {
    initialEntries = await getTopBuzzwordsForServer(HALL_OF_SHAME_LIMIT)
  } catch (error) {
    // Log error but don't crash the page
    console.error('Failed to fetch buzzwords on server:', error)
    // Return empty array - client will handle fetching
  }

  // Pass to Client Component for interactivity
  return <HallOfShameClient initialEntries={initialEntries} />
}
