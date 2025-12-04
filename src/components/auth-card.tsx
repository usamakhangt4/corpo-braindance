'use client'

import { useState } from 'react'
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

  // Check username availability
  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameCheck({ checking: false, available: null })
      return
    }

    setUsernameCheck({ checking: true, available: null })

    try {
      const { checkUsernameAvailability } = await import('@/app/actions/auth')
      const { available, error: checkError } = await checkUsernameAvailability(value)

      setUsernameCheck({
        checking: false,
        available,
        message: checkError || (available ? 'Username available' : 'Username already taken'),
      })
    } catch (err) {
      setUsernameCheck({ checking: false, available: null, message: 'Failed to check username' })
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        // Validate username for signup
        if (!username || username.length < 3) {
          setError('Username must be at least 3 characters')
          setIsLoading(false)
          return
        }

        if (usernameCheck.available === false) {
          setError('Username is already taken')
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
    setError(null)
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
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <Input
            id="emailOrUsername"
            type={mode === 'login' ? 'text' : 'email'}
            placeholder={mode === 'login' ? 'user@corpo.com or username' : 'user@corpo.com'}
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
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <Input
              id="username"
              type="text"
              placeholder="cool_username"
              value={username}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                setUsername(value)
                if (value.length >= 3) {
                  checkUsername(value)
                } else {
                  setUsernameCheck({ checking: false, available: null })
                }
              }}
              required
              disabled={isLoading}
              variant="neural"
              hasIcon
              minLength={3}
              pattern="[a-zA-Z0-9_]{3,}"
            />
            {/* Username availability indicator */}
            {username.length >= 3 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameCheck.checking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted" />
                ) : usernameCheck.available === true ? (
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                ) : usernameCheck.available === false ? (
                  <XCircle className="w-4 h-4 text-status-error" />
                ) : null}
              </div>
            )}
          </div>
          {usernameCheck.message && username.length >= 3 && (
            <p
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
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
        <Chrome className="w-4 h-4 mr-2" />
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
                <span>Don't have an account? </span>
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
