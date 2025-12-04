'use server'

import { getSupabaseClient } from '@/lib/supabase/client'

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  if (!username || username.length < 3) {
    return { available: false, error: 'Username must be at least 3 characters' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { available: false, error: 'Username can only contain letters, numbers, and underscores' }
  }

  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.rpc('username_exists', { check_username: username })

    if (error) {
      console.error('Error checking username:', error)
      return { available: false, error: 'Failed to check username availability' }
    }

    return { available: !data }
  } catch (error) {
    console.error('Error checking username:', error)
    return { available: false, error: 'Failed to check username availability' }
  }
}

/**
 * Create or update user profile with username
 * If username is not provided (e.g., Google OAuth), generates one from user ID
 */
export async function createUserProfile(
  userId: string,
  username?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseClient()

    // If no username provided (OAuth flow), generate one
    if (!username) {
      const baseUsername = `user_${userId.substring(0, 8)}`
      username = baseUsername

      // Ensure username is unique
      let counter = 1
      const originalUsername = username
      while (true) {
        const { data: exists } = await supabase.rpc('username_exists', { check_username: username })
        if (!exists) break
        username = `${originalUsername}_${counter}`
        counter++
        if (counter > 100) {
          // Fallback to timestamp-based username
          username = `user_${userId.substring(0, 8)}_${Date.now()}`
          break
        }
      }
    } else {
      // Username provided - check if it's available
      const { data: exists } = await supabase.rpc('username_exists', { check_username: username })
      if (exists) {
        return { success: false, error: 'Username already taken' }
      }
    }

    // Check if profile already exists (might have been created by trigger)
    // Use maybeSingle() instead of single() to avoid error if profile doesn't exist
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .maybeSingle()

    // If error is not "not found", log it
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
      })
    }

    if (existingProfile) {
      // Profile exists - update username if different
      if (existingProfile.username !== username) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            username: username,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          console.error('Error updating profile username:', {
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
          })
          return { success: false, error: updateError.message || 'Failed to update profile username' }
        }
      }
      return { success: true }
    }

    // Profile doesn't exist - create it with all required fields
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      username: username,
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
      notification_preferences: { email: true, push: false },
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Error creating profile:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return { success: false, error: error.message || 'Failed to create profile' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating profile:', error)
    return { success: false, error: 'Failed to create profile' }
  }
}

/**
 * Get username by user ID
 */
export async function getUsernameByUserId(userId: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('profiles').select('username').eq('id', userId).single()

    if (error || !data) {
      return null
    }

    return data.username
  } catch (error) {
    console.error('Error getting username:', error)
    return null
  }
}

/**
 * Get user ID by username (for username-based signin)
 */
export async function getUserIdByUsername(username: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('profiles').select('id').eq('username', username).single()

    if (error || !data) {
      return null
    }

    return data.id
  } catch (error) {
    console.error('Error getting user ID by username:', error)
    return null
  }
}

/**
 * Get email by username (for username-based signin)
 * Uses a database function that joins profiles with auth.users
 */
export async function getEmailByUsername(username: string): Promise<string | null> {
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.rpc('get_email_by_username', { check_username: username })

    if (error || !data) {
      return null
    }

    return data as string
  } catch (error) {
    console.error('Error getting email by username:', error)
    return null
  }
}
