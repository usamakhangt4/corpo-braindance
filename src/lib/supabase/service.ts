import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

interface AuthDatabase {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: {
      get_email_by_username: {
        Args: { check_username: string }
        Returns: string | null
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

let serviceRoleClient: SupabaseClient<AuthDatabase> | undefined

export function getSupabaseServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Server-side Supabase credentials are not configured.')
  }

  if (!serviceRoleClient) {
    serviceRoleClient = createClient<AuthDatabase>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return serviceRoleClient
}
