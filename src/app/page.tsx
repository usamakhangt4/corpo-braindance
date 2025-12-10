'use client'

import { useEffect } from 'react'
import { FilePenLine, RefreshCcw } from 'lucide-react'
import { BUZZWORD_ROLES, ROLE_LABELS } from '@/lib/constants/buzzwords'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { useBuzzwordStore } from '@/lib/stores/use-buzzword-store'
import { useSubmitBuzzword } from '@/hooks/use-buzzwords'
import { NeuralCard } from '@/components/NeuralCard'
import { toast } from 'sonner'

export default function Home() {
  // Use Zustand stores for UI state
  const { currentBuzzword: data, role, animate, setRole, generate } = useBuzzwordStore()
  const { user } = useAuthStore()

  // React Query for mutations
  const submitBuzzword = useSubmitBuzzword()

  // Initialize auth and generate first buzzword
  useEffect(() => {
    useAuthStore.getState().initialize()
    generate(role)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copyToClipboard = () => {
    if (!data) return
    navigator.clipboard.writeText(`${data.phrase}\n"${data.fullSentence}"`)
    toast.success('Synergy successfully leveraged to clipboard!')
  }

  const submitToHR = async () => {
    if (!data) return

    // Check authentication client-side first
    if (!user) {
      toast.warning('Please sign in to submit buzzwords to HR.')
      return
    }

    try {
      await toast.promise(submitBuzzword.mutateAsync(data), {
        loading: 'Submitting to HR...',
        success: 'Filed to Permanent Record.',
        error: (error) => {
          const errorMessage = error instanceof Error ? error.message : 'HR rejected your submission.'
          return errorMessage
        },
      })
    } catch (error) {
      // Error is already handled by toast.promise
      console.error(error)
    }
  }

  if (!data) return null

  return (
    <main className="min-h-screen bg-surface-base text-primary font-sans flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      {/* TODO: need to create a header component so we can use it across multiple pages */}
      <header className="w-full max-w-3xl text-center mb-10 mt-8">
        <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
          CORPO // BRAINDANCE
        </h1>
        <p className="text-neural-primary-dark font-mono text-xs tracking-[0.5em] uppercase">Neural Link Established</p>
        <p className="text-muted text-lg">Generate enterprise-grade nonsense for 2025.</p>
      </header>
      {/* Role Switcher Tabs - Neural Interface Mode Selector */}
      {/* TODO: need to create a role switcher component also we might need to add other roles as well also we can update the ui as well so it stays respinsive on multiple view points */}
      <div className="relative flex items-center gap-2 mb-8 flex-col md:flex-row">
        <span className="text-xs font-mono text-neural-primary-hover uppercase tracking-wider border-r border-neural-primary/30 pr-4">
          [MODE]
        </span>
        <div className="flex bg-surface-base/80 border-2 border-neural-primary/30 p-1 shadow-neural">
          {BUZZWORD_ROLES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r)
                generate(r)
              }}
              className={`
                relative px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200
                ${
                  role === r
                    ? 'bg-neural-primary/20 text-neural-primary-light border border-neural-primary-hover/50 shadow-neural-accent'
                    : 'text-muted hover:text-neural-primary-hover hover:bg-surface-elevated/50 border border-transparent hover:border-neural-primary/20'
                }
              `}
            >
              {role === r && (
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-neural-primary-hover text-[10px]">
                  &gt;
                </span>
              )}
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Card - Holographic Neural Interface Display */}
      <NeuralCard animate={animate}>
        {/* Label */}
        <div className="flex justify-center md:justify-between items-center mb-6 gap-2 flex-wrap">
          <span className="text-xs font-bold text-neural-primary-hover uppercase tracking-[0.2em] border border-neural-primary/50 bg-neural-primary/10 backdrop-blur-sm px-3 py-1 rounded">
            [{data.role} MODE]
          </span>

          {/* Fun "Synergy Score" */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase font-semibold">Synergy Score:</span>
            <span className={`text-xl font-bold ${data.score > 90 ? 'text-status-success' : 'text-status-warning'}`}>
              {data.score}%
            </span>
          </div>
        </div>

        {/* The Phrase */}
        <h2 className="text-3xl md:text-5xl font-serif font-medium text-primary leading-tight mb-8 text-center md:text-left">
          "{data.phrase}"
        </h2>

        {/* The "Meaning" - Terminal output style */}
        <div className="bg-surface-elevated/60 border border-neural-primary/20 rounded-lg p-5 shadow-lg backdrop-blur-sm">
          <p className="text-neural-primary-light font-mono text-sm leading-relaxed">
            <span className="text-neural-primary-hover font-bold mr-2">&gt;</span>
            {data.fullSentence}
          </p>
        </div>
      </NeuralCard>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-md">
        {/* TODO: need to update the button component to use borders like we have in cyberpunk website */}
        <Button variant="gradient" size="xl" onClick={() => generate(role)} className="w-full md:w-1/2">
          <RefreshCcw className={`w-6 h-6 ${animate ? 'animate-spin' : ''}`} />
          Generate
        </Button>

        <Button
          variant="slate"
          size="xl"
          onClick={() => {
            // TODO: for copy to clipborad we need to create and position an icon button somewhere inside the neural card component
            copyToClipboard()
            if (user && user.email) {
              submitToHR()
            }
          }}
          className="w-full md:w-1/2"
        >
          <FilePenLine className="w-6 h-6" />
          <span>{user && user.email ? 'Submit to HR' : 'Copy to Clipboard'}</span>
        </Button>
      </div>
    </main>
  )
}
