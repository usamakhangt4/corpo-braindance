'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem('corpo-braindance-splash-shown')

    if (hasSeenSplash === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      localStorage.setItem('corpo-braindance-splash-shown', 'true')
      return
    }

    let progressInterval: ReturnType<typeof setInterval> | undefined
    let fadeTimer: ReturnType<typeof setTimeout> | undefined
    let removeTimer: ReturnType<typeof setTimeout> | undefined
    const showFrame = window.requestAnimationFrame(() => {
      setIsVisible(true)
      localStorage.setItem('corpo-braindance-splash-shown', 'true')
      document.body.style.overflow = 'hidden'

      progressInterval = setInterval(() => {
        setProgress((previous) => {
          if (previous >= 100) {
            if (progressInterval) clearInterval(progressInterval)
            return 100
          }
          return previous + 2
        })
      }, 60)

      fadeTimer = setTimeout(() => setIsAnimating(true), 3000)
      removeTimer = setTimeout(() => {
        setIsVisible(false)
        document.body.style.overflow = ''
      }, 3500)
    })

    return () => {
      window.cancelAnimationFrame(showFrame)
      if (progressInterval) clearInterval(progressInterval)
      if (fadeTimer) clearTimeout(fadeTimer)
      if (removeTimer) clearTimeout(removeTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading application"
      className={`
        fixed inset-0 z-9999 flex flex-col items-center justify-center bg-surface-base transition-opacity duration-500
        ${isAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Animated background grid */}
      <div aria-hidden="true" className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
            CORPO // BRAINDANCE
          </h1>
          <p className="text-neural-primary-dark font-mono text-xs tracking-[0.5em] uppercase">Loading…</p>
        </div>

        {/* Loading dots */}
        <LoadingSpinner />

        {/* Progress bar */}
        <div className="w-full max-w-xs space-y-2">
          <div
            role="progressbar"
            aria-label="Application loading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-1 bg-surface-overlay rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-linear-to-r from-neural-primary-hover to-neural-secondary-light rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted text-center font-mono">{progress}%</p>
        </div>

        {/* Status text */}
        <p className="text-muted text-lg text-center max-w-md">Please wait…</p>
      </div>
    </div>
  )
}
