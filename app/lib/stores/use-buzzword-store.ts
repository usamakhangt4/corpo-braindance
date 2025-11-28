'use client'

import { create } from 'zustand'
import type { BuzzwordData, BuzzwordRole } from '@/lib/types/buzzword'

interface BuzzwordStore {
  // State
  currentBuzzword: BuzzwordData | null
  role: BuzzwordRole
  history: BuzzwordData[]

  // Actions
  setBuzzword: (buzzword: BuzzwordData) => void
  setRole: (role: BuzzwordRole) => void
  addToHistory: (buzzword: BuzzwordData) => void
  clearHistory: () => void
}

export const useBuzzwordStore = create<BuzzwordStore>((set) => ({
  // Initial state
  currentBuzzword: null,
  role: 'ceo',
  history: [],

  // Actions
  setBuzzword: (buzzword) => set({ currentBuzzword: buzzword }),
  setRole: (role) => set({ role }),
  addToHistory: (buzzword) =>
    set((state) => ({
      history: [buzzword, ...state.history].slice(0, 10), // Keep last 10
    })),
  clearHistory: () => set({ history: [] }),
}))
