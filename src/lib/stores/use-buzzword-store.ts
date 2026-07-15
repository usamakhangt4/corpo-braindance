'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { fileBuzzword, generateBuzzword } from '@/lib/buzzwords/lab'
import type { BuzzwordData, BuzzwordRole, DossierEntry } from '@/lib/types/buzzword'

interface BuzzwordStore {
  hydrated: boolean
  currentBuzzword: BuzzwordData | null
  role: BuzzwordRole
  dossier: DossierEntry[]
  animate: boolean
  generate: (role?: BuzzwordRole) => void
  fileCurrent: () => boolean
  removeFromDossier: (id: string) => void
  clearDossier: () => void
  restoreDossier: (entries: DossierEntry[]) => void
}

export const useBuzzwordStore = create<BuzzwordStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      currentBuzzword: null,
      role: 'ceo',
      dossier: [],
      animate: false,

      generate: (selectedRole) => {
        const role = selectedRole ?? get().role
        const buzzword = generateBuzzword(role)

        set({
          currentBuzzword: buzzword,
          role,
          animate: true,
        })

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

      restoreDossier: (entries) =>
        set((state) => ({
          dossier: [...entries, ...state.dossier]
            .filter((entry, index, allEntries) => allEntries.findIndex((candidate) => candidate.id === entry.id) === index)
            .slice(0, 20),
        })),
    }),
    {
      name: 'corpo-braindance-dossier',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        dossier: state.dossier,
        role: state.role,
      }),
    },
  ),
)
