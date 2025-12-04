'use client'

import { create } from 'zustand'
import { createBrowserClient } from '@supabase/ssr'
import type { User, Session } from '@supabase/supabase-js'

// Use SSR browser client for proper cookie handling - singleton pattern
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseInstance
}

const supabase = getSupabaseClient()

interface AuthStore {
  // State
  user: User | null
  loading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Async actions
  initialize: () => Promise<void>
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => {
  return {
    // Initial state
    user: null,
    loading: true,
    error: null,

    // Sync actions
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    // Async actions
    initialize: async () => {
      try {
        // Read session from cookies
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          set({ user: null, loading: false })
          return
        }

        set({ user: session?.user ?? null, loading: false })
      } catch (error) {
        console.error('Auth initialization error:', error)
        set({
          error: error instanceof Error ? error.message : 'Auth initialization failed',
          loading: false,
        })
      }
    },

    signIn: async (emailOrUsername: string, password: string) => {
      try {
        // Check if input is email or username
        const isEmail = emailOrUsername.includes('@')
        let email = emailOrUsername

        // If username, look up email
        if (!isEmail) {
          const { getEmailByUsername } = await import('@/app/actions/auth')
          const foundEmail = await getEmailByUsername(emailOrUsername)
          if (!foundEmail) {
            return { error: new Error('Invalid username or password') }
          }
          email = foundEmail
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? new Error(error.message) : null }
      } catch (error) {
        return { error: error instanceof Error ? error : new Error('Sign in failed') }
      }
    },

    signUp: async (email: string, password: string, username: string) => {
      try {
        // Sign up user
        const { data, error } = await supabase.auth.signUp({ email, password })
        
        if (error) {
          return { error: new Error(error.message) }
        }

        // If user was created, create profile with username
        if (data.user) {
          const { createUserProfile } = await import('@/app/actions/auth')
          const { success, error: profileError } = await createUserProfile(data.user.id, username)
          
          if (!success) {
            // User created but profile failed - sign out the user to prevent orphaned account
            await supabase.auth.signOut()
            return { error: new Error(profileError || 'Failed to create profile. Please try again.') }
          }
        }

        return { error: null }
      } catch (error) {
        return { error: error instanceof Error ? error : new Error('Sign up failed') }
      }
    },

    signInWithGoogle: async () => {
      try {
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
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Sign out error:', error)
      } finally {
        set({ user: null, loading: false })
      }
    },
  }
})

// Set up auth state change listener after store is created
if (typeof window !== 'undefined') {
  // Use a global flag to ensure listener is only set up once
  if (!(globalThis as any).__authListenerSetup) {
    ;(globalThis as any).__authListenerSetup = true
    
    // Listen for auth changes globally
    supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      // Update store state when auth changes
      useAuthStore.setState({ user: session?.user ?? null, loading: false })
    })
  }
}
