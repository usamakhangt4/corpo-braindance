'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { AuthCard } from './auth-card'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'login' | 'signup'
  title?: string
  description?: string
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, mode: initialMode = 'login', title, description }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'bg-slate-900/95 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]',
          'backdrop-blur-sm sm:max-w-md',
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn('text-2xl font-bold text-cyan-300 font-mono uppercase tracking-wider', 'text-left')}
          >
            {title || (mode === 'login' ? 'Access Neural Link' : 'Register Neural Link')}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-left">
            {description ||
              (mode === 'login'
                ? 'Enter your credentials to establish connection'
                : 'Create an account to join the network')}
          </DialogDescription>
        </DialogHeader>

        <div className="font-sans">
          <AuthCard showHeader={false} mode={mode} onModeChange={setMode} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
