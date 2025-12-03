/**
 * Unified Supabase client helper
 * Works in both client and server contexts
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Type-safe global client storage
declare global {
  // eslint-disable-next-line no-var
  var supabaseClient: ReturnType<typeof createBrowserClient> | undefined
}

/**
 * Get Supabase client for the current context
 * - Client Components: Returns browser client (singleton)
 * - Server Components: Returns server client with cookies
 */
export async function getSupabaseClient(): Promise<ReturnType<typeof createBrowserClient>> {
  if (typeof window === 'undefined') {
    // Server-side: dynamically import cookies only when needed
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Ignore in Server Components (middleware handles it)
            }
          },
        },
      },
    )
  } else {
    // Client-side: create browser client (singleton)
    if (!globalThis.supabaseClient) {
      globalThis.supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    }
    return globalThis.supabaseClient
  }
}
