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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
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

    signIn: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? new Error(error.message) : null }
      } catch (error) {
        return { error: error instanceof Error ? error : new Error('Sign in failed') }
      }
    },

    signUp: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error ? new Error(error.message) : null }
      } catch (error) {
        return { error: error instanceof Error ? error : new Error('Sign up failed') }
      }
    },

    signOut: async () => {
      await supabase.auth.signOut()
      set({ user: null })
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
