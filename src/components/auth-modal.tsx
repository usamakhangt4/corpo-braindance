'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { AuthCard } from './auth-card'
import {AuthMode} from '@/lib/types/auth'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: AuthMode,
  title?: string
  description?: string
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, mode: initialMode = 'login', title, description }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'bg-surface-elevated/95 border-2 border-neural-primary/30 shadow-neural-lg',
          'backdrop-blur-sm sm:max-w-md',
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn('text-2xl font-bold text-neural-primary-light font-mono uppercase tracking-wider', 'text-left')}
          >
            {title || (mode === 'login' ? 'Access Neural Link' : 'Register Neural Link')}
          </DialogTitle>
          <DialogDescription className="text-muted text-left">
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
