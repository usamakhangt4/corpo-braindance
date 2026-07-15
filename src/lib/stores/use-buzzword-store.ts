'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { fileBuzzword, generateBuzzword } from '@/lib/buzzwords/lab'
import type { BuzzwordData, BuzzwordRole, DossierEntry } from '@/lib/types/buzzword'

interface BuzzwordStore {
  hydrated: boolean
  currentBuzzword: BuzzwordData | null
  role: BuzzwordRole
  history: BuzzwordData[]
  dossier: DossierEntry[]
  animate: boolean
  generate: (role?: BuzzwordRole) => void
  fileCurrent: () => boolean
  removeFromDossier: (id: string) => void
  clearDossier: () => void
}

export const useBuzzwordStore = create<BuzzwordStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      currentBuzzword: null,
      role: 'ceo',
      history: [],
      dossier: [],
      animate: false,

      generate: (selectedRole) => {
        const role = selectedRole ?? get().role
        const buzzword = generateBuzzword(role)

        set((state) => ({
          currentBuzzword: buzzword,
          role,
          animate: true,
          history: [buzzword, ...state.history].slice(0, 10),
        }))

        window.setTimeout(() => set({ animate: false }), 360)
      },

      fileCurrent: () => {
        const current = get().currentBuzzword
        if (!current) return false

        const result = fileBuzzword(get().dossier, current)
        if (result.added) {
          set({ dossier: result.entries })
        }
        return result.added
      },

      removeFromDossier: (id) =>
        set((state) => ({
          dossier: state.dossier.filter((entry) => entry.id !== id),
        })),

      clearDossier: () => set({ dossier: [] }),
    }),
    {
      name: 'corpo-braindance-dossier',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        history: state.history,
        dossier: state.dossier,
        role: state.role,
      }),
    },
  ),
)
