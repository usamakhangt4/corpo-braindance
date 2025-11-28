'use client'

import { useState, useCallback } from 'react'
import { generateBuzzword } from '@/lib/buzzwords'
import type { BuzzwordData, BuzzwordRole } from '@/lib/types/buzzword'

interface UseBuzzwordReturn {
  data: BuzzwordData | null
  role: BuzzwordRole
  animate: boolean
  setRole: (role: BuzzwordRole) => void
  generate: (selectedRole?: BuzzwordRole) => void
}

export function useBuzzword(initialRole: BuzzwordRole = 'ceo'): UseBuzzwordReturn {
  const [data, setData] = useState<BuzzwordData | null>(null)
  const [role, setRole] = useState<BuzzwordRole>(initialRole)
  const [animate, setAnimate] = useState(false)

  const generate = useCallback(
    (selectedRole?: BuzzwordRole) => {
      setAnimate(true)
      setTimeout(() => setAnimate(false), 300)

      const newData = generateBuzzword(selectedRole || role)
      setData(newData)
    },
    [role]
  )

  return {
    data,
    role,
    animate,
    setRole,
    generate,
  }
}

