'use client'

import { useEffect } from 'react'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'

export function LocalStateHydrator() {
  useEffect(() => {
    let active = true

    void Promise.resolve(useBuzzwordStore.persist.rehydrate()).finally(() => {
      if (active) {
        useBuzzwordStore.setState({ hydrated: true })
      }
    })

    return () => {
      active = false
    }
  }, [])

  return null
}
