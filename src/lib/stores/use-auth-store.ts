'use client'

import { create } from 'zustand'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

declare global {
  var __corpoAuthListenerSetup: boolean | undefined
}

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  initialize: async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        set({ user: null, loading: false })
        return
      }

      set({ user, loading: false, error: null })
    } catch (error) {
      console.error('Auth initialization failed:', error)
      set({
        user: null,
        error: error instanceof Error ? error.message : 'Auth initialization failed',
        loading: false,
      })
    }
  },

  signIn: async (emailOrUsername, password) => {
    try {
      const { signInWithPasswordAction } = await import('@/app/actions/auth')
      const result = await signInWithPasswordAction(emailOrUsername, password)

      if (result.error) {
        return { error: new Error(result.error) }
      }

      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        return { error: new Error('Unable to verify the new session. Please try again.') }
      }

      set({ user, loading: false, error: null })
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') }
    }
  },

  signUp: async (email, password, username) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      set({ user: data.session?.user ?? null, loading: false, error: null })
      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') }
    }
  },

  signInWithGoogle: async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return { error: error ? new Error(error.message) : null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Google sign in failed') }
    }
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient()

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      set({ user: null, loading: false })
    }
  },
}))

if (typeof window !== 'undefined' && !globalThis.__corpoAuthListenerSetup) {
  globalThis.__corpoAuthListenerSetup = true
  const supabase = getSupabaseBrowserClient()

  supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    useAuthStore.setState({ user: session?.user ?? null, loading: false })
  })
}
