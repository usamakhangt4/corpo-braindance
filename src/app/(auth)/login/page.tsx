'use client'

import { AuthCard } from '@/components/auth-card'
import { ROUTES } from '@/lib/constants/routes'
import { useState } from 'react'
import { AuthMode } from '@/lib/types/auth'
import { BrandLogo } from '@/components/BrandLogo'

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="min-h-screen bg-surface-base text-primary font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <BrandLogo href={ROUTES.HOME} size="md" />
          </div>
          <p className="text-muted font-mono text-xs tracking-[0.5em] uppercase">
            {mode === 'login' ? 'Neural Authentication Required' : 'Sign up to join the network'}
          </p>
        </div>

        {/* Auth Card - no controlled mode, uses internal state */}
        <AuthCard mode={mode} onModeChange={setMode} />
      </div>
    </div>
  )
}
