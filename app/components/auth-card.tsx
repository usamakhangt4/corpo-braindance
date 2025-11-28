'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import { AuthMode } from '@/lib/types/auth'

interface AuthCardProps {
  mode: AuthMode
  title?: string
  description?: string
  showHeader?: boolean
  onSuccess?: () => void
  onModeChange: (mode: AuthMode) => void
  className?: string
  cardClassName?: string
}

export function AuthCard({
  mode,
  title,
  description,
  showHeader = true,
  onSuccess,
  onModeChange,
  className,
  cardClassName,
}: AuthCardProps) {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error: authError } = mode === 'login' ? await signIn(email, password) : await signUp(email, password)

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      // Success
      setIsLoading(false)
      if (onSuccess) {
        onSuccess()
      } else {
        if (mode === 'login') {
          router.push(ROUTES.HOME)
        }
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setError(null)
    onModeChange(newMode)
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="user@corpo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            variant="neural"
            hasIcon
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-cyan-400 font-mono text-xs uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            variant="neural"
            hasIcon
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} variant="neural" className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === 'login' ? 'Establishing Connection...' : 'Registering...'}
          </>
        ) : mode === 'login' ? (
          'Authenticate'
        ) : (
          'Register'
        )}
      </Button>
    </form>
  )

  if (showHeader) {
    return (
      <div className={className}>
        <Card
          className={cn(
            'bg-slate-900/80 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]',
            'backdrop-blur-sm py-6',
            cardClassName,
          )}
        >
          <CardHeader className="space-y-1">
            <CardTitle
              className={cn('text-2xl font-bold text-cyan-300 font-mono uppercase tracking-wider', 'leading-none')}
            >
              {title || (mode === 'login' ? 'Access Neural Link' : 'Register Neural Link')}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {description ||
                (mode === 'login'
                  ? 'Enter your credentials to establish connection'
                  : 'Create an account to join the network')}
            </CardDescription>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
          <CardFooter className="text-center text-sm text-slate-400 grid">
            {mode === 'login' ? (
              <>
                <span>Don't have an account? </span>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
                >
                  Register Neural Link
                </Button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-cyan-400 hover:text-cyan-300 font-mono uppercase tracking-wider transition-colors"
                >
                  Sign In
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <div className={className}>{formContent}</div>
}
