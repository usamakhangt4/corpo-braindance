'use client'

import { create } from 'zustand'
import { generateBuzzwordAction } from '@/app/actions/buzzword'
import type { BuzzwordData, BuzzwordRole } from '@/lib/types/buzzword'

interface BuzzwordStore {
  // State
  currentBuzzword: BuzzwordData | null
  role: BuzzwordRole
  history: BuzzwordData[]
  animate: boolean
  loading: boolean

  // Actions
  setBuzzword: (buzzword: BuzzwordData) => void
  setRole: (role: BuzzwordRole) => void
  setAnimate: (animate: boolean) => void
  addToHistory: (buzzword: BuzzwordData) => void
  clearHistory: () => void
  generate: (selectedRole?: BuzzwordRole) => Promise<void>
}

export const useBuzzwordStore = create<BuzzwordStore>((set, get) => ({
  // Initial state
  currentBuzzword: null,
  role: 'ceo',
  history: [],
  animate: false,
  loading: false,

  // Actions
  setBuzzword: (buzzword) => set({ currentBuzzword: buzzword }),
  setRole: (role) => set({ role }),
  setAnimate: (animate) => set({ animate }),
  addToHistory: (buzzword) =>
    set((state) => ({
      history: [buzzword, ...state.history].slice(0, 10), // Keep last 10
    })),
  clearHistory: () => set({ history: [] }),

  // Generate new buzzword using server action
  generate: async (selectedRole) => {
    const role = selectedRole || get().role
    set({ animate: true, loading: true })

    try {
      const newData = await generateBuzzwordAction(role)
      set({ currentBuzzword: newData, animate: false, loading: false })
      get().addToHistory(newData)
    } catch (error) {
      console.error('Failed to generate buzzword:', error)
      set({ animate: false, loading: false })
    }
  },
}))
