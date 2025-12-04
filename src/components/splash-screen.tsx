'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { BrandLogo } from '@/components/BrandLogo'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Check if splash has been shown before
    const hasSeenSplash = localStorage.getItem('corpo-braindance-splash-shown')

    if (hasSeenSplash === 'true') {
      return
    }

    // Show splash screen
    setIsVisible(true)
    localStorage.setItem('corpo-braindance-splash-shown', 'true')

    // Prevent body scroll when splash is visible
    document.body.style.overflow = 'hidden'

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 60) // Update every 60ms to reach 100% in ~3 seconds

    // Start fade out animation after 3 seconds
    const fadeTimer = setTimeout(() => {
      setIsAnimating(true)
    }, 3000)

    // Remove from DOM after fade animation completes
    const removeTimer = setTimeout(() => {
      setIsVisible(false)
      document.body.style.overflow = ''
    }, 3500) // 3s delay + 0.5s fade duration

    return () => {
      clearInterval(progressInterval)
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
      document.body.style.overflow = ''
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`
        fixed inset-0 z-9999 flex flex-col items-center justify-center bg-surface-base transition-opacity duration-500
        ${isAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <h1 className="glitch-text cursor-default text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to from-yellow-300 via-pink-500 to-cyan-400 mb-2 uppercase tracking-tighter">
            CORPO // BRAINDANCE
          </h1>
          <p className="text-neural-primary-dark font-mono text-xs tracking-[0.5em] uppercase">Loading...</p>
        </div>

        {/* Loading dots */}
        <LoadingSpinner />

        {/* Progress bar */}
        <div className="w-full max-w-xs space-y-2">
          <div className="h-1 bg-surface-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-neural-primary-hover to-neural-secondary-light rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted text-center font-mono">{progress}%</p>
        </div>

        {/* Status text */}
        <p className="text-muted text-lg text-center max-w-md">Please wait...</p>
      </div>
    </div>
  )
}
