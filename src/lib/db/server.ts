/**
 * Server-side database adapter factory
 * For use in Server Components and API routes only
 * 
 * ⚠️ DO NOT import this in Client Components
 */

import { ServerBuzzwordDb } from './adapters/server-buzzword-db'
import type { IBuzzwordDb } from './adapters/buzzword-db'

/**
 * Server-side database adapter factory (for Server Components and API routes)
 * Uses Supabase server SDK with cookie-based auth
 */
export function getServerBuzzwordDb(): IBuzzwordDb {
  return new ServerBuzzwordDb()
}

