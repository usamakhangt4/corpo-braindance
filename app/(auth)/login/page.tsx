'use client'

import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { ROUTES } from '@/lib/constants/routes'
import { useState } from 'react'
import { AuthMode } from '@/lib/types/auth'

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href={ROUTES.HOME} className="inline-block mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-lg"></div>
              <div className="relative px-4 py-2 border border-cyan-500/30 rounded-lg bg-slate-900/50">
                <span className="text-cyan-400 font-mono text-sm font-bold tracking-wider">CORPO // BRAINDANCE</span>
              </div>
            </div>
          </Link>
          <p className="text-slate-400 font-mono text-xs tracking-[0.5em] uppercase">
            {mode === 'login' ? 'Neural Authentication Required' : 'Sign up to join the network'}
          </p>
        </div>

        {/* Auth Card - no controlled mode, uses internal state */}
        <AuthCard mode={mode} onModeChange={setMode} />
      </div>
    </div>
  )
}
