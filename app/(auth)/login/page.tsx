'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(ROUTES.LOGIN)
  }, [router])

  return null
}
