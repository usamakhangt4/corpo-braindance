'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Lock, User, CheckCircle2, XCircle } from 'lucide-react'
import { Chrome } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import { AuthMode } from '@/lib/types/auth'
import { ErrorMessage } from '@/components/ErrorMessage'

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
  const { signIn, signUp, signInWithGoogle } = useAuthStore()
  const [emailOrUsername, setEmailOrUsername] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean
    available: boolean | null
    message?: string
  }>({
    checking: false,
    available: null,
  })
  const usernameRequestRef = useRef(0)

  useEffect(() => {
    if (mode !== 'signup' || username.length < 3) return

    const requestId = ++usernameRequestRef.current
    const timer = window.setTimeout(async () => {
      try {
        const { checkUsernameAvailability } = await import('@/app/actions/auth')
        const { available, error: checkError } = await checkUsernameAvailability(username)

        if (usernameRequestRef.current === requestId) {
          setUsernameCheck({
            checking: false,
            available,
            message: checkError || (available ? 'Username available' : 'Username already taken'),
          })
        }
      } catch {
        if (usernameRequestRef.current === requestId) {
          setUsernameCheck({ checking: false, available: null, message: 'Unable to check username availability.' })
        }
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      if (usernameRequestRef.current === requestId) {
        usernameRequestRef.current += 1
      }
    }
  }, [mode, username])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        // Validate username for signup
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
          setError('Username must be 3–30 characters using only letters, numbers, and underscores.')
          setIsLoading(false)
          return
        }

        if (usernameCheck.checking || usernameCheck.available !== true) {
          setError('Choose an available username before registering.')
          setIsLoading(false)
          return
        }

        // Sign up with email, password, and username
        const { error: authError } = await signUp(emailOrUsername, password, username)

        if (authError) {
          setError(authError.message)
          setIsLoading(false)
          return
        }
      } else {
        // Sign in with email or username
        const { error: authError } = await signIn(emailOrUsername, password)

        if (authError) {
          setError(authError.message)
          setIsLoading(false)
          return
        }
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
    usernameRequestRef.current += 1
    setError(null)
    setUsernameCheck({ checking: false, available: null })
    onModeChange(newMode)
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && <ErrorMessage message={error} />}

      {/* Email or Username Field (for login) / Email Field (for signup) */}
      <div className="space-y-2">
        <Label
          htmlFor="emailOrUsername"
          className="text-neural-primary-hover font-mono text-xs uppercase tracking-wider"
        >
          {mode === 'login' ? 'Email or Username' : 'Email Address'}
        </Label>
        <div className="relative">
          <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <Input
            id="emailOrUsername"
            name={mode === 'login' ? 'identifier' : 'email'}
            type={mode === 'login' ? 'text' : 'email'}
            inputMode={mode === 'login' ? 'text' : 'email'}
            autoComplete={mode === 'login' ? 'username' : 'email'}
            spellCheck={false}
            placeholder={mode === 'login' ? 'name@example.com or username…' : 'name@example.com…'}
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            disabled={isLoading}
            variant="neural"
            hasIcon
          />
        </div>
      </div>

      {/* Username Field (for signup only) */}
      {mode === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="username" className="text-neural-primary-hover font-mono text-xs uppercase tracking-wider">
            Username
          </Label>
          <div className="relative">
            <User aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              spellCheck={false}
              placeholder="cool_username…"
              value={username}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                setUsername(value)
                if (value.length >= 3) {
                  setUsernameCheck({ checking: true, available: null, message: 'Checking availability…' })
                } else {
                  setUsernameCheck({ checking: false, available: null })
                }
              }}
              required
              disabled={isLoading}
              variant="neural"
              hasIcon
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]{3,30}"
              aria-describedby="username-status"
              aria-invalid={usernameCheck.available === false}
            />
            {/* Username availability indicator */}
            {username.length >= 3 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameCheck.checking ? (
                  <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin text-muted" />
                ) : usernameCheck.available === true ? (
                  <CheckCircle2 aria-hidden="true" className="w-4 h-4 text-status-success" />
                ) : usernameCheck.available === false ? (
                  <XCircle aria-hidden="true" className="w-4 h-4 text-status-error" />
                ) : null}
              </div>
            )}
          </div>
          {usernameCheck.message && username.length >= 3 && (
            <p
              id="username-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className={`text-xs font-mono ${
                usernameCheck.available === true
                  ? 'text-status-success'
                  : usernameCheck.available === false
                  ? 'text-status-error'
                  : 'text-muted'
              }`}
            >
              {usernameCheck.message}
            </p>
          )}
        </div>
      )}

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-neural-primary-hover font-mono text-xs uppercase tracking-wider">
          Password
        </Label>
        <div className="relative">
          <Lock aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
      <Button type="submit" disabled={isLoading} aria-busy={isLoading} variant="neural" className="w-full">
        {isLoading ? (
          <>
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
            {mode === 'login' ? 'Establishing Connection…' : 'Registering…'}
          </>
        ) : mode === 'login' ? (
          'Authenticate'
        ) : (
          'Register'
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-base"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-elevated px-2 text-muted font-mono tracking-wider">or</span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={async () => {
          setIsLoading(true)
          setError(null)
          const { error: googleError } = await signInWithGoogle()
          if (googleError) {
            setError(googleError.message)
            setIsLoading(false)
          }
        }}
        disabled={isLoading}
        variant="slate"
        className="w-full"
      >
        <Chrome aria-hidden="true" className="w-4 h-4 mr-2" />
        Continue with Google
      </Button>
    </form>
  )

  if (showHeader) {
    return (
      <div className={className}>
        <Card
          className={cn(
            'bg-surface-elevated/80 border-2 border-neural-primary/30 shadow-neural-lg',
            'backdrop-blur-sm py-6',
            cardClassName,
          )}
        >
          <CardHeader className="space-y-1">
            <CardTitle
              className={cn(
                'text-2xl font-bold text-neural-primary-light font-mono uppercase tracking-wider',
                'leading-none',
              )}
            >
              {title || (mode === 'login' ? 'Access Neural Link' : 'Register Neural Link')}
            </CardTitle>
            <CardDescription className="text-muted">
              {description ||
                (mode === 'login'
                  ? 'Enter your credentials to establish connection'
                  : 'Create an account to join the network')}
            </CardDescription>
          </CardHeader>
          <CardContent>{formContent}</CardContent>
          <CardFooter className="text-center text-sm text-muted grid">
            {mode === 'login' ? (
              <>
                <span>Don&apos;t have an account? </span>
                <Button
                  variant="link"
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-neural-primary-hover hover:text-neural-primary-light font-mono uppercase tracking-wider transition-colors"
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
                  className="text-neural-primary-hover hover:text-neural-primary-light font-mono uppercase tracking-wider transition-colors"
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
