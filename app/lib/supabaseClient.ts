/**
 * Supabase client for non-database operations
 * 
 * ⚠️ For database operations, use the service layer instead:
 * - Import from @/lib/services/buzzword-service
 * 
 * This client is kept for:
 * - Authentication (supabase.auth)
 * - Storage (supabase.storage)
 * - Real-time subscriptions (supabase.from('table').on(...))
 * 
 * Database queries should go through the abstraction layer:
 * @see app/lib/db/adapters/ for database adapters
 * @see app/lib/services/ for business logic
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)
