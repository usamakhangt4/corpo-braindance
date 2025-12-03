# CORPO BRAINDANCE - Step-by-Step Implementation Guide

> Complete guide to implementing the project with best practices, one testable step at a time.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Step 1: Setup Constants](#step-1-setup-constants)
4. [Step 2: Setup Database Layer](#step-2-setup-database-layer)
5. [Step 3: Setup Service Layer](#step-3-setup-service-layer)
6. [Step 4: Setup Zustand Stores](#step-4-setup-zustand-stores)
7. [Step 5: Implement Home Page](#step-5-implement-home-page)
8. [Step 6: Implement Hall of Shame Page](#step-6-implement-hall-of-shame-page)
9. [Step 7: Implement Browse Page](#step-7-implement-browse-page)
10. [Component Decision Tree](#component-decision-tree)

---

## Architecture Overview

### Component Types

**Server Components (default - no `'use client'`):**
- ✅ Fetch initial data
- ✅ SEO-friendly
- ✅ Fast initial load
- ❌ No interactivity (onClick, onChange)
- ❌ No React hooks (useState, useEffect)
- ❌ No browser APIs (localStorage, window)

**Client Components (`'use client'`):**
- ✅ User interactions (onClick, forms)
- ✅ React hooks (useState, useEffect)
- ✅ Browser APIs
- ✅ Zustand stores
- ❌ Slower initial load
- ❌ Not SEO-friendly for dynamic content

### Data Flow

```
Server Component (page.tsx)
    ↓
Service (BuzzwordService)
    ↓
Database Adapter
    ↓
Supabase

Client Component (interactive parts)
    ↓
Zustand Store
    ↓
Service (BuzzwordService)
    ↓
Database Adapter
    ↓
Supabase
```

---

## Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (features)/              # Feature pages
│   │   ├── hall-of-shame/
│   │   │   ├── page.tsx         # Server Component (fetches data)
│   │   │   └── hall-of-shame-client.tsx  # Client Component (interactions)
│   │   └── browse/
│   │       ├── page.tsx         # Server Component
│   │       └── browse-client.tsx # Client Component
│   ├── (user)/                  # User pages
│   ├── (auth)/                  # Auth pages
│   ├── api/                     # API routes
│   ├── components/               # Shared components
│   └── page.tsx                 # Home page (Client Component)
│
├── lib/
│   ├── constants/               # Constants
│   │   ├── buzzwords.ts
│   │   └── routes.ts
│   ├── db/                      # Database layer
│   │   └── buzzword-db.ts      # Unified database adapter
│   ├── services/                # Business logic
│   │   └── buzzword-service.ts # Unified service
│   ├── stores/                  # Zustand stores (CLIENT ONLY)
│   │   ├── use-buzzword-store.ts
│   │   ├── use-voting-store.ts
│   │   └── use-auth-store.ts
│   ├── supabase/                # Supabase helpers
│   │   └── client.ts           # Unified Supabase client
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts
│   │   └── buzzword.ts
│   ├── buzzwords.ts             # Buzzword generation logic
│   ├── supabaseClient.ts        # For auth (kept separate)
│   └── utils.ts                 # Utility functions
│
└── hooks/                       # Custom hooks (if needed)
```

---

## Step 1: Setup Constants

**Goal:** Create all constants in one place.

**File:** `src/lib/constants/buzzwords.ts`

```typescript
/**
 * Constants for buzzword generation data
 */

export const BUZZWORD_DATA = {
  // ... your existing data ...
}

export const BUZZWORD_ROLES = ['ceo', 'sales', 'tech'] as const

export const ROLE_LABELS: Record<string, string> = {
  ceo: 'VISIONARY',
  sales: 'GROWTH',
  tech: 'ENGINEERING',
} as const

// Page-specific limits
export const HALL_OF_SHAME_LIMIT = 10
export const BROWSE_PAGE_LIMIT = 50
export const DEFAULT_LIMIT = 10
```

**File:** `src/lib/constants/routes.ts`

```typescript
/**
 * Route path constants
 */

export const ROUTES = {
  HOME: '/',
  HALL_OF_SHAME: '/hall-of-shame',
  BROWSE: '/browse',
  LOGIN_PAGE: '/login',
  PROFILE_PAGE: '/profile',
  SETTINGS_PAGE: '/settings',
} as const
```

**✅ Test:** Import constants in any file - should work without errors.

---

## Step 2: Setup Database Layer

**Goal:** Create unified database adapter that works in both client and server.

### 2.1: Create Unified Supabase Client

**File:** `src/lib/supabase/client.ts`

```typescript
/**
 * Unified Supabase client helper
 * Works in both client and server contexts
 */

import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get Supabase client for the current context
 * - Client Components: Returns browser client (singleton)
 * - Server Components: Returns server client with cookies
 */
export async function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side: create client with cookies
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
              cookiesToSet.forEach(({ name, value, options }) => 
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore in Server Components (middleware handles it)
            }
          },
        },
      }
    )
  } else {
    // Client-side: create browser client (singleton)
    if (!globalThis.supabaseClient) {
      globalThis.supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return globalThis.supabaseClient
  }
}
```

### 2.2: Create Unified Database Adapter

**File:** `src/lib/db/buzzword-db.ts`

```typescript
/**
 * Unified buzzword database adapter
 * Works in both client and server contexts
 */

import { getSupabaseClient } from '@/lib/supabase/client'
import type { BuzzwordEntry } from '@/lib/types/buzzword'

export type SortOption = 'newest' | 'oldest' | 'most_upvotes' | 'least_upvotes'

export interface GetAllBuzzwordsOptions {
  limit?: number
  offset?: number
  sortBy?: SortOption
}

export interface IBuzzwordDb {
  getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]>
  getAllBuzzwords(options?: GetAllBuzzwordsOptions): Promise<BuzzwordEntry[]>
  createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>): Promise<BuzzwordEntry>
  updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry>
  getById(id: number): Promise<BuzzwordEntry | null>
}

class BuzzwordDb implements IBuzzwordDb {
  async getTopBuzzwords(limit: number): Promise<BuzzwordEntry[]> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('buzzwords')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []) as BuzzwordEntry[]
  }

  async getAllBuzzwords(options: GetAllBuzzwordsOptions = {}): Promise<BuzzwordEntry[]> {
    const { limit = 50, offset = 0, sortBy = 'newest' } = options
    const supabase = await getSupabaseClient()

    let query = supabase.from('buzzwords').select('*')

    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'most_upvotes':
        query = query.order('upvotes', { ascending: false })
        break
      case 'least_upvotes':
        query = query.order('upvotes', { ascending: true })
        break
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) throw error
    return (data || []) as BuzzwordEntry[]
  }

  async createBuzzword(data: Omit<BuzzwordEntry, 'id' | 'created_at' | 'upvotes'>): Promise<BuzzwordEntry> {
    const supabase = await getSupabaseClient()
    const { data: result, error } = await supabase
      .from('buzzwords')
      .insert({
        phrase: data.phrase,
        meaning: data.meaning,
        department: data.department,
        synergy_score: data.synergy_score,
      })
      .select()
      .single()

    if (error) throw error
    return result as BuzzwordEntry
  }

  async updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('buzzwords')
      .update({ upvotes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error(`Buzzword with id ${id} not found`)
    return data as BuzzwordEntry
  }

  async getById(id: number): Promise<BuzzwordEntry | null> {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from('buzzwords').select('*').eq('id', id).single()
    if (error) return null
    return data as BuzzwordEntry
  }
}

// Export singleton instance
export const buzzwordDb = new BuzzwordDb()
```

**✅ Test:** Try importing `buzzwordDb` in a test file - should compile without errors.

---

## Step 3: Setup Service Layer

**Goal:** Create unified service that works everywhere.

**File:** `src/lib/services/buzzword-service.ts`

```typescript
/**
 * Unified buzzword service
 * Works in both Server Components and Client Components
 * 
 * Server Components: Use directly
 * Client Components: Use via Zustand stores
 */

import { buzzwordDb } from '@/lib/db/buzzword-db'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import type { BuzzwordData } from '@/lib/types/buzzword'
import type { BuzzwordEntry } from '@/lib/types/buzzword'
import type { GetAllBuzzwordsOptions } from '@/lib/db/buzzword-db'

export class BuzzwordService {
  /**
   * Submit a buzzword
   */
  static async submitBuzzword(data: BuzzwordData): Promise<BuzzwordEntry> {
    return await buzzwordDb.createBuzzword({
      phrase: data.phrase,
      meaning: data.fullSentence,
      department: data.role,
      synergy_score: data.score,
    })
  }

  /**
   * Get top buzzwords by upvotes
   * @param limit - Maximum number of results (default: HALL_OF_SHAME_LIMIT)
   */
  static async getTopBuzzwords(limit: number = HALL_OF_SHAME_LIMIT): Promise<BuzzwordEntry[]> {
    return await buzzwordDb.getTopBuzzwords(limit)
  }

  /**
   * Get all buzzwords with pagination and sorting
   */
  static async getAllBuzzwords(options?: GetAllBuzzwordsOptions): Promise<BuzzwordEntry[]> {
    return await buzzwordDb.getAllBuzzwords(options)
  }

  /**
   * Update upvotes for a buzzword
   */
  static async updateUpvotes(id: number, upvotes: number): Promise<BuzzwordEntry> {
    return await buzzwordDb.updateUpvotes(id, upvotes)
  }

  /**
   * Get buzzword by ID
   */
  static async getById(id: number): Promise<BuzzwordEntry | null> {
    return await buzzwordDb.getById(id)
  }
}
```

**✅ Test:** Import `BuzzwordService` in a test file - should compile.

---

## Step 4: Setup Zustand Stores

**Goal:** Create Zustand stores for client-side state management.

### 4.1: Buzzword Store

**File:** `src/lib/stores/use-buzzword-store.ts`

```typescript
'use client'

import { create } from 'zustand'
import { generateBuzzword } from '@/lib/buzzwords'
import type { BuzzwordData, BuzzwordRole } from '@/lib/types/buzzword'

interface BuzzwordStore {
  // State
  currentBuzzword: BuzzwordData | null
  role: BuzzwordRole
  history: BuzzwordData[]
  animate: boolean

  // Actions
  setBuzzword: (buzzword: BuzzwordData) => void
  setRole: (role: BuzzwordRole) => void
  setAnimate: (animate: boolean) => void
  addToHistory: (buzzword: BuzzwordData) => void
  clearHistory: () => void
  generate: (selectedRole?: BuzzwordRole) => void
}

export const useBuzzwordStore = create<BuzzwordStore>((set, get) => ({
  // Initial state
  currentBuzzword: null,
  role: 'ceo',
  history: [],
  animate: false,

  // Actions
  setBuzzword: (buzzword) => set({ currentBuzzword: buzzword }),
  setRole: (role) => set({ role }),
  setAnimate: (animate) => set({ animate }),
  addToHistory: (buzzword) =>
    set((state) => ({
      history: [buzzword, ...state.history].slice(0, 10), // Keep last 10
    })),
  clearHistory: () => set({ history: [] }),

  // Generate new buzzword
  generate: (selectedRole) => {
    const role = selectedRole || get().role
    set({ animate: true })
    
    setTimeout(() => {
      const newData = generateBuzzword(role)
      set({ currentBuzzword: newData, animate: false })
      get().addToHistory(newData)
    }, 300)
  },
}))
```

### 4.2: Voting Store

**File:** `src/lib/stores/use-voting-store.ts`

```typescript
'use client'

import { create } from 'zustand'
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import { useAuthStore } from './use-auth-store'
import type { BuzzwordEntry } from '@/lib/types/buzzword'
import type { VoteAction } from '@/lib/types/buzzword'

interface VotingStore {
  // State
  entries: BuzzwordEntry[]
  loading: boolean
  votingIds: Set<number>
  error: string | null

  // Actions
  setEntries: (entries: BuzzwordEntry[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addVotingId: (id: number) => void
  removeVotingId: (id: number) => void
  
  // Async actions
  fetchTopPhrases: (limit?: number) => Promise<void>
  fetchAllPhrases: (options?: { sortBy?: string; limit?: number }) => Promise<void>
  handleVote: (id: number, action: VoteAction) => Promise<void>
  refreshEntries: () => Promise<void>
}

export const useVotingStore = create<VotingStore>((set, get) => ({
  // Initial state
  entries: [],
  loading: false,
  votingIds: new Set(),
  error: null,

  // Sync actions
  setEntries: (entries) => set({ entries }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addVotingId: (id) => set((state) => ({ votingIds: new Set(state.votingIds).add(id) })),
  removeVotingId: (id) =>
    set((state) => {
      const next = new Set(state.votingIds)
      next.delete(id)
      return { votingIds: next }
    }),

  // Async actions
  fetchTopPhrases: async (limit = HALL_OF_SHAME_LIMIT) => {
    set({ loading: true, error: null })
    try {
      const data = await BuzzwordService.getTopBuzzwords(limit)
      set({ entries: data, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch phrases', 
        loading: false 
      })
    }
  },

  fetchAllPhrases: async (options = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await BuzzwordService.getAllBuzzwords(options)
      set({ entries: data, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch phrases', 
        loading: false 
      })
    }
  },

  handleVote: async (id: number, action: VoteAction) => {
    const { user } = useAuthStore.getState()
    if (!user) {
      set({ error: 'Authentication required' })
      return
    }

    const { entries, votingIds } = get()
    if (votingIds.has(id)) return

    get().addVotingId(id)

    const currentEntry = entries.find((e) => e.id === id)
    if (!currentEntry) {
      get().removeVotingId(id)
      return
    }

    const newUpvotes = action === 'promote' 
      ? currentEntry.upvotes + 1 
      : Math.max(0, currentEntry.upvotes - 1)

    // Optimistic update
    set({
      entries: entries.map((entry) => 
        entry.id === id ? { ...entry, upvotes: newUpvotes } : entry
      ),
    })

    try {
      await BuzzwordService.updateUpvotes(id, newUpvotes)
      await get().fetchTopPhrases() // Refresh to get correct ordering
    } catch (error) {
      console.error('Error voting:', error)
      await get().fetchTopPhrases() // Revert on error
    } finally {
      get().removeVotingId(id)
    }
  },

  refreshEntries: async () => {
    await get().fetchTopPhrases()
  },
}))
```

### 4.3: Auth Store

**File:** `src/lib/stores/use-auth-store.ts`

```typescript
'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

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

export const useAuthStore = create<AuthStore>((set) => ({
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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, loading: false })

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null, loading: false })
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Auth initialization failed', 
        loading: false 
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
}))
```

**✅ Test:** Import stores in a test Client Component - should compile.

---

## Step 5: Implement Home Page

**Goal:** Convert home page to use Zustand store.

### 5.1: Update Home Page Component

**File:** `src/app/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { FilePenLine, RefreshCcw } from 'lucide-react'
import { BUZZWORD_ROLES, ROLE_LABELS } from '@/lib/constants/buzzwords'
import { Button } from '@/components/ui/button'

export default function Home() {
  // Use Zustand stores instead of hooks
  const { currentBuzzword: data, role, animate, setRole, generate } = useBuzzwordStore()
  const { user } = useAuthStore()

  // Initialize auth and generate first buzzword
  useEffect(() => {
    useAuthStore.getState().initialize()
    generate(role)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = () => {
    if (!data) return
    navigator.clipboard.writeText(`${data.phrase}\n"${data.fullSentence}"`)
    alert('Synergy successfully leveraged to clipboard!')
  }

  const submitToHR = async () => {
    if (!data) return
    try {
      await BuzzwordService.submitBuzzword(data)
      alert('Filed to Permanent Record.')
    } catch (error) {
      alert('Error: HR rejected your submission.')
      console.error(error)
    }
  }

  if (!data) return null

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-3xl text-center mb-10 mt-8">
        <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
          CORPO // BRAINDANCE
        </h1>
        <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase">Neural Link Established</p>
        <p className="text-slate-400 text-lg">Generate enterprise-grade nonsense for 2025.</p>
      </header>

      {/* Role Switcher Tabs */}
      <div className="relative flex items-center gap-2 mb-8 flex-col md:flex-row">
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider border-r border-cyan-500/30 pr-4">
          [MODE]
        </span>
        <div className="flex bg-slate-950/80 border-2 border-cyan-500/30 p-1 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          {BUZZWORD_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r)
                generate(r)
              }}
              className={`
                relative px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200
                ${
                  role === r
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-900/50 border border-transparent hover:border-cyan-500/20'
                }
              `}
            >
              {role === r && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-cyan-400 text-[10px]">&gt;</span>
              )}
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl relative group perspective-1000">
        {/* ... your existing card UI ... */}
        <div
          className={`
            relative bg-slate-950/90 backdrop-blur-sm border-2 border-cyan-500/40 rounded-lg p-4 sm:p-6 md:p-8 lg:p-12 shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden transition-all duration-300 z-10
            hover:border-cyan-400/60 hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]
            ${animate ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
        `}
        >
          {/* ... your existing content ... */}
          <div className="relative z-10">
            <div className="flex justify-center md:justify-between items-center mb-6 gap-2 flex-wrap">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] border border-cyan-500/50 bg-cyan-500/10 backdrop-blur-sm px-3 py-1 rounded">
                [{data.role} MODE]
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Synergy Score:</span>
                <span className={`text-xl font-bold ${data.score > 90 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {data.score}%
                </span>
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif font-medium text-slate-100 leading-tight mb-8 text-center md:text-left">
              "{data.phrase}"
            </h2>

            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-5 shadow-lg backdrop-blur-sm">
              <p className="text-cyan-300 font-mono text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold mr-2">&gt;</span>
                {data.fullSentence}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-md">
        <Button variant="gradient" size="xl" onClick={() => generate(role)} className="w-full md:w-1/2">
          <RefreshCcw className={`w-6 h-6 ${animate ? 'animate-spin' : ''}`} />
          Generate
        </Button>

        <Button
          variant="slate"
          size="xl"
          onClick={() => {
            if (user && user.email) {
              submitToHR()
            }
            copyToClipboard()
          }}
          className="w-full md:w-1/2"
        >
          <FilePenLine className="w-6 h-6" />
          <span>{user && user.email ? 'Submit to HR' : 'Copy to Clipboard'}</span>
        </Button>
      </div>
    </main>
  )
}
```

**✅ Test:** 
1. Run `npm run dev`
2. Visit home page
3. Should see buzzword generated
4. Click "Generate" - should work
5. Switch roles - should work
6. Click "Copy to Clipboard" - should work

---

## Step 6: Implement Hall of Shame Page

**Goal:** Use Server Component for initial data, Client Component for interactions.

### 6.1: Create Server Component (Page)

**File:** `src/app/(features)/hall-of-shame/page.tsx`

```typescript
// Server Component - NO 'use client'
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { HALL_OF_SHAME_LIMIT } from '@/lib/constants/buzzwords'
import { HallOfShameClient } from './hall-of-shame-client'

export default async function HallOfShamePage() {
  // Fetch data on the server (fast, SEO-friendly)
  const initialEntries = await BuzzwordService.getTopBuzzwords(HALL_OF_SHAME_LIMIT)
  
  // Pass to Client Component for interactivity
  return <HallOfShameClient initialEntries={initialEntries} />
}
```

### 6.2: Create Client Component

**File:** `src/app/(features)/hall-of-shame/hall-of-shame-client.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVotingStore } from '@/lib/stores/use-voting-store'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { VoteAction, BuzzwordEntry } from '@/lib/types/buzzword'
import { AuthModal } from '@/components/auth-modal'

interface HallOfShameClientProps {
  initialEntries: BuzzwordEntry[]
}

export function HallOfShameClient({ initialEntries }: HallOfShameClientProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  // Use Zustand stores
  const { entries, loading, votingIds, handleVote, setEntries } = useVotingStore()
  const { user } = useAuthStore()

  // Initialize with server data
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries, setEntries])

  const handleVoteClick = (id: number, action: VoteAction) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    handleVote(id, action)
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-4 md:p-8">
        {/* Header */}
        <header className="w-full max-w-4xl text-center mb-10 mt-8">
          <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
            HALL // OF SHAME
          </h1>
          <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase mb-2">Performance Review Portal</p>
          <p className="text-slate-400 text-lg">Top 10 Most Cringeworthy Phrases Ranked by Upvotes</p>
        </header>

        {/* Rankings List */}
        <div className="w-full max-w-4xl space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase">Loading Performance Reviews...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No entries yet. Be the first to submit to HR!</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl overflow-hidden transition-all hover:border-cyan-500/50 group"
              >
                {/* ... your existing entry UI ... */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVoteClick(entry.id, 'promote')}
                    disabled={votingIds.has(entry.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Promote
                  </button>
                  <button
                    onClick={() => handleVoteClick(entry.id, 'fire')}
                    disabled={votingIds.has(entry.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Fire
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={mode}
        onSuccess={() => {
          setMode('login')
          useVotingStore.getState().refreshEntries()
        }}
        title={mode === 'login' ? 'Sign in to Vote' : 'Sign up to Vote'}
        description="You need to be authenticated to vote on buzzwords"
      />
    </>
  )
}
```

**✅ Test:**
1. Visit `/hall-of-shame`
2. Should see entries immediately (no loading spinner on first load)
3. Click "Promote" or "Fire" - should work
4. If not logged in, should show auth modal

---

## Step 7: Implement Browse Page

**Goal:** Create browse page with sorting.

### 7.1: Create Server Component

**File:** `src/app/(features)/browse/page.tsx`

```typescript
// Server Component
import { BuzzwordService } from '@/lib/services/buzzword-service'
import { BROWSE_PAGE_LIMIT } from '@/lib/constants/buzzwords'
import { BrowseClient } from './browse-client'

export default async function BrowsePage() {
  // Fetch data on the server (newest first for discovery)
  const initialEntries = await BuzzwordService.getAllBuzzwords({
    sortBy: 'newest',
    limit: BROWSE_PAGE_LIMIT,
  })

  return <BrowseClient initialEntries={initialEntries} />
}
```

### 7.2: Create Client Component

**File:** `src/app/(features)/browse/browse-client.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVotingStore } from '@/lib/stores/use-voting-store'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import type { VoteAction, BuzzwordEntry } from '@/lib/types/buzzword'
import type { SortOption } from '@/lib/db/buzzword-db'
import { AuthModal } from '@/components/auth-modal'

interface BrowseClientProps {
  initialEntries: BuzzwordEntry[]
}

export function BrowseClient({ initialEntries }: BrowseClientProps) {
  const { user } = useAuthStore()
  const { entries, loading, votingIds, fetchAllPhrases, handleVote, setEntries } = useVotingStore()
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries, setEntries])

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    fetchAllPhrases({ sortBy: newSort, limit: 50 })
  }

  const handleVoteClick = (id: number, action: VoteAction) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    handleVote(id, action)
  }

  return (
    <>
      <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-4 md:p-8">
        <header className="w-full max-w-4xl text-center mb-10 mt-8">
          <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
            BROWSE // PHRASES
          </h1>
          <p className="text-cyan-600 font-mono text-xs tracking-[0.5em] uppercase mb-2">Discovery Portal</p>
          <p className="text-slate-400 text-lg">Discover and vote on all submitted phrases</p>
        </header>

        {/* Sort Controls */}
        <div className="w-full max-w-4xl mb-6 flex gap-2 flex-wrap">
          {(['newest', 'oldest', 'most_upvotes', 'least_upvotes'] as SortOption[]).map((sort) => (
            <button
              key={sort}
              onClick={() => handleSortChange(sort)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                sortBy === sort
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-cyan-500/50'
              }`}
            >
              {sort.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="w-full max-w-4xl space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase">Loading...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No entries yet. Be the first to submit!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl overflow-hidden transition-all hover:border-cyan-500/50 group"
              >
                {/* ... entry UI similar to Hall of Shame ... */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleVoteClick(entry.id, 'promote')}
                    disabled={votingIds.has(entry.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Promote
                  </button>
                  <button
                    onClick={() => handleVoteClick(entry.id, 'fire')}
                    disabled={votingIds.has(entry.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Fire
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        mode={mode}
        onSuccess={() => setMode('login')}
        title={mode === 'login' ? 'Sign in to Vote' : 'Sign up to Vote'}
        description="You need to be authenticated to vote on buzzwords"
      />
    </>
  )
}
```

**✅ Test:**
1. Visit `/browse`
2. Should see all phrases
3. Change sort - should work
4. Vote on phrases - should work

---

## Component Decision Tree

### Should this be a Server Component or Client Component?

```
Does it need interactivity?
├─ NO → Server Component ✅
│   └─ Use: Service directly
│   └─ Example: Initial data fetching
│
└─ YES → Client Component ✅
    └─ Use: Zustand store
    └─ Example: Buttons, forms, real-time updates
```

### What goes in a Store vs Service?

**Store (Zustand - Client Only):**
- ✅ Client-side state (UI state, loading, errors)
- ✅ Optimistic updates
- ✅ State that needs to be shared across components
- ✅ Actions that trigger UI updates
- ❌ Direct database calls (use Service instead)

**Service (Works Everywhere):**
- ✅ Database operations
- ✅ Business logic
- ✅ Data transformation
- ✅ API calls
- ❌ UI state management

### Example:

```typescript
// ✅ Store - manages UI state
const { entries, loading, handleVote } = useVotingStore()

// ✅ Service - called by store
await BuzzwordService.updateUpvotes(id, upvotes)
```

---

## File Naming Conventions

- **Components:** `kebab-case.tsx` (e.g., `hall-of-shame-client.tsx`)
- **Stores:** `use-*-store.ts` (e.g., `use-voting-store.ts`)
- **Services:** `*-service.ts` (e.g., `buzzword-service.ts`)
- **Types:** `*.ts` (e.g., `buzzword.ts`)
- **Constants:** `*.ts` (e.g., `buzzwords.ts`)
- **Utils:** `utils.ts` or `*-utils.ts`

---

## Testing Checklist

After each step, test:

1. ✅ **Compilation:** `npm run build` should succeed
2. ✅ **TypeScript:** No type errors
3. ✅ **Runtime:** Page loads without errors
4. ✅ **Functionality:** Core features work
5. ✅ **Console:** No errors in browser console

---

## Common Patterns

### Pattern 1: Server Component + Client Component

```typescript
// page.tsx (Server)
export default async function Page() {
  const data = await Service.getData()
  return <ClientComponent initialData={data} />
}

// client-component.tsx (Client)
'use client'
export function ClientComponent({ initialData }) {
  const store = useStore()
  useEffect(() => {
    store.setData(initialData)
  }, [initialData])
  return <div>{/* UI */}</div>
}
```

### Pattern 2: Client Component Only (for interactive pages)

```typescript
// page.tsx (Client)
'use client'
export default function Page() {
  const store = useStore()
  useEffect(() => {
    store.fetchData()
  }, [])
  return <div>{/* UI */}</div>
}
```

---

## Troubleshooting

### Error: "use client" in Server Component
**Solution:** Remove `'use client'` from Server Components

### Error: Can't use hooks in Server Component
**Solution:** Move to Client Component or use Server Component for data fetching only

### Error: Store not working
**Solution:** Make sure component has `'use client'` directive

### Error: Service not found
**Solution:** Check import path - should be `@/lib/services/buzzword-service`

---

## Next Steps

1. ✅ Complete Step 1 (Constants)
2. ✅ Complete Step 2 (Database Layer)
3. ✅ Complete Step 3 (Service Layer)
4. ✅ Complete Step 4 (Stores)
5. ✅ Complete Step 5 (Home Page)
6. ✅ Complete Step 6 (Hall of Shame)
7. ✅ Complete Step 7 (Browse Page)
8. 🔄 Add more features as needed

---

**Remember:** Complete one step, test it, then move to the next. Don't skip steps!

