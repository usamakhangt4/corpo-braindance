/**
 * Client-side database adapter
 * For use in Client Components only
 */

import { SupabaseBuzzwordDb } from './adapters/supabase-buzzword-db'
import type { IBuzzwordDb } from './adapters/buzzword-db'

/**
 * Client-side database adapter (for Client Components)
 * Uses Supabase client SDK
 */
export const buzzwordDb: IBuzzwordDb = new SupabaseBuzzwordDb()
