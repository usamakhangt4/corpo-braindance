import 'server-only'

import { createPublicSupabaseClient } from '@/lib/supabase/public-server'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export async function getTopBuzzwordsForServer(limit: number): Promise<BuzzwordEntry[]> {
  const supabase = createPublicSupabaseClient()
  const { data, error } = await supabase
    .from('buzzwords')
    .select('*')
    .order('upvotes', { ascending: false })
    .limit(limit)

  if (error) {
    throw error
  }

  return (data ?? []) as BuzzwordEntry[]
}
