'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(ROUTES.SIGNUP)
  }, [router])

  return null
}
