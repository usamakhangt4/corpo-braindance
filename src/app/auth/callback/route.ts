import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createUserProfile } from '@/app/actions/auth'

/**
 * OAuth callback handler
 * Handles Google OAuth redirect and creates user profile if needed
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Extract user metadata from OAuth provider (Google)
      const userMetadata = data.user.user_metadata || {}
      const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null
      const displayName = userMetadata.full_name || userMetadata.name || null

      // Wait a moment for database trigger to potentially create profile
      // Then check if profile exists, if not create one with generated username
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      const { data: profile } = await supabase.from('profiles').select('username, avatar_url').eq('id', data.user.id).single()

      if (!profile) {
        // Profile doesn't exist - create it with auto-generated username and OAuth data
        // Use Server Action to ensure proper username generation
        const { success, error: profileError } = await createUserProfile(data.user.id)
        
        if (success) {
          // Update with OAuth metadata if profile was created
          await supabase
            .from('profiles')
            .update({
              avatar_url: avatarUrl,
              display_name: displayName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id)
        } else {
          console.error('Failed to create profile:', profileError)
          // Try direct upsert as fallback
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: `user_${data.user.id.substring(0, 8)}_${Date.now()}`,
            avatar_url: avatarUrl,
            display_name: displayName,
            updated_at: new Date().toISOString(),
          })
        }
      } else {
        // Profile exists, but update avatar_url and display_name if they're from Google OAuth and not set
        if (avatarUrl && !profile.avatar_url) {
          await supabase
            .from('profiles')
            .update({
              avatar_url: avatarUrl,
              display_name: displayName || profile.display_name,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id)
        } else if (displayName) {
          // Update display_name even if avatar exists
          await supabase
            .from('profiles')
            .update({
              display_name: displayName,
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.user.id)
        }
      }

      // Redirect to home page
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If error or no code, redirect to login
  return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url))
}

