'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/service'
import { isValidPassword, isValidSignInIdentifier, isValidUsername } from '@/lib/validation/auth'

const INVALID_CREDENTIALS = 'Invalid email, username, or password.'

export async function checkUsernameAvailability(username: unknown): Promise<{ available: boolean; error?: string }> {
  if (!isValidUsername(username)) {
    return {
      available: false,
      error: 'Username must be 3-30 characters using only letters, numbers, and underscores.',
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.rpc('username_exists', { check_username: username })

    if (error) {
      console.error('Username availability check failed:', error)
      return { available: false, error: 'Unable to check username availability.' }
    }

    return { available: !data }
  } catch (error) {
    console.error('Username availability check failed:', error)
    return { available: false, error: 'Unable to check username availability.' }
  }
}

export async function signInWithPasswordAction(
  identifier: unknown,
  password: unknown,
): Promise<{ error: string | null }> {
  if (!isValidSignInIdentifier(identifier) || !isValidPassword(password)) {
    return { error: INVALID_CREDENTIALS }
  }

  const normalizedIdentifier = identifier.trim()
  let email = normalizedIdentifier

  try {
    if (!normalizedIdentifier.includes('@')) {
      if (!isValidUsername(normalizedIdentifier)) {
        return { error: INVALID_CREDENTIALS }
      }

      const serviceClient = getSupabaseServiceRoleClient()
      const { data, error } = await serviceClient.rpc('get_email_by_username', {
        check_username: normalizedIdentifier,
      })

      if (error || typeof data !== 'string') {
        return { error: INVALID_CREDENTIALS }
      }

      email = data
    }

    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    return { error: error ? INVALID_CREDENTIALS : null }
  } catch (error) {
    console.error('Password sign-in failed:', error)
    return { error: INVALID_CREDENTIALS }
  }
}
