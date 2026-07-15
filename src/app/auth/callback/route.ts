import { NextResponse } from 'next/server'
import { getSafeRedirectPath } from '@/lib/security/redirect'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const nextPath = getSafeRedirectPath(requestUrl.searchParams.get('next'))

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const userMetadata = data.user.user_metadata || {}
      const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null
      const displayName = userMetadata.full_name || userMetadata.name || null
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('OAuth profile update failed:', profileError)
      }

      return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_failed', requestUrl.origin))
}
