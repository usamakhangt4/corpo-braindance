'use client'

import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RadialMenuItem {
  href: string
  label: string
  icon: LucideIcon
  action?: 'logout' | 'profile-menu'
}

interface RadialMenuProps {
  items: RadialMenuItem[]
  centerItem?: RadialMenuItem | null
  isOpen: boolean
  onClose: () => void
  onItemClick?: (item: RadialMenuItem) => void
  showBackButton?: boolean
  onBack?: () => void
}

export default function RadialMenu({
  items,
  centerItem,
  isOpen,
  onClose,
  onItemClick,
  showBackButton = false,
  onBack,
}: RadialMenuProps) {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [screenCenter, setScreenCenter] = useState({ x: 0, y: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousShowBackButtonRef = useRef<boolean>(showBackButton)
  const previousItemsRef = useRef<RadialMenuItem[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  // Detect menu transitions synchronously before paint
  useLayoutEffect(() => {
    if (isOpen && items.length > 0) {
      const menuChanged =
        previousShowBackButtonRef.current !== showBackButton ||
        previousItemsRef.current.length !== items.length ||
        previousItemsRef.current.some((prevItem, index) => {
          const currentItem = items[index]
          return !currentItem || prevItem.href !== currentItem.href || prevItem.action !== currentItem.action
        })

      if (menuChanged && previousItemsRef.current.length > 0) {
        // Set transitioning synchronously before React paints
        setIsTransitioning(true)
        setHoveredIndex(null)

        // Use requestAnimationFrame to ensure state is set before next paint
        requestAnimationFrame(() => {
          // Reset transition state after animation completes
          setTimeout(() => {
            setIsTransitioning(false)
          }, 400)
        })

        // Update refs
        previousShowBackButtonRef.current = showBackButton
        previousItemsRef.current = items
      } else {
        // Update refs for first render or when no change
        if (previousItemsRef.current.length === 0 || !menuChanged) {
          previousShowBackButtonRef.current = showBackButton
          previousItemsRef.current = items
        }
      }
    } else if (!isOpen) {
      // Reset when menu closes
      previousShowBackButtonRef.current = showBackButton
      previousItemsRef.current = []
      setIsTransitioning(false)
      setHoveredIndex(null)
    }
  }, [isOpen, items, showBackButton])

  // Reset hover state when menu closes
  useEffect(() => {
    if (!isOpen) {
      setHoveredIndex(null)
      setIsTransitioning(false)
      previousShowBackButtonRef.current = showBackButton
      previousItemsRef.current = []
    }
  }, [isOpen, showBackButton])

  // Calculate screen center on mount and window resize
  useEffect(() => {
    const updateScreenCenter = () => {
      setScreenCenter({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      })
    }

    updateScreenCenter()
    window.addEventListener('resize', updateScreenCenter)

    return () => {
      window.removeEventListener('resize', updateScreenCenter)
    }
  }, [])

  // Calculate positions for each item in a circle
  const radius = 100 // Distance from center to items
  const itemSize = 64 // Size of each menu item

  // Filter out center item from radial items
  const radialItems = items.filter((item) => {
    if (!centerItem) return true
    return item.href !== centerItem.href || item.action !== centerItem.action
  })

  const itemPositions = radialItems.map((_, index) => {
    const angle = (index * 2 * Math.PI) / radialItems.length - Math.PI / 2 // Start from top
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    return { x, y, angle }
  })

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBackButton && onBack) {
          onBack()
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, showBackButton, onBack])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // Calculate menu container position to center it on screen
  const menuSize = radius * 2 + itemSize
  const menuLeft = screenCenter.x - menuSize / 2
  const menuTop = screenCenter.y - menuSize / 2

  // Glassmorphic circle size - slightly larger than the menu items area
  const glassCircleSize = radius * 2 + itemSize + 40
  const glassCircleOffset = (menuSize - glassCircleSize) / 2

  const handleItemClick = (item: RadialMenuItem, e: React.MouseEvent) => {
    if (item.action) {
      e.preventDefault()
      onItemClick?.(item)
    } else if (onItemClick) {
      onItemClick(item)
    }
  }

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-98 transition-opacity duration-300"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={menuRef}
        className="fixed pointer-events-auto z-99"
        style={{
          left: `${menuLeft}px`,
          top: `${menuTop}px`,
          width: `${menuSize}px`,
          height: `${menuSize}px`,
        }}
      >
        {/* Glassmorphic background circle */}
        <div
          className="absolute rounded-full pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: `${glassCircleOffset}px`,
            top: `${glassCircleOffset}px`,
            width: `${glassCircleSize}px`,
            height: `${glassCircleSize}px`,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '2px solid rgba(6, 182, 212, 0.4)',
            boxShadow: `
              inset 0 0 50px rgba(6, 182, 212, 0.15),
              0 0 80px rgba(6, 182, 212, 0.25),
              0 8px 32px rgba(0, 0, 0, 0.5)
            `,
            transform: isOpen ? 'scale(1)' : 'scale(0)',
            opacity: isOpen ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
            animation: isOpen ? 'pulse-glow 3s ease-in-out infinite' : 'none',
          }}
        >
          {/* Inner glow ring */}
          <div
            className="absolute inset-2 rounded-full border border-neural-primary/30"
            style={{
              boxShadow: 'inset 0 0 25px rgba(6, 182, 212, 0.2)',
            }}
          />
        </div>

        {/* Crosshair lines - Horizontal and Vertical */}
        <svg
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            width: menuSize,
            height: menuSize,
            opacity: isTransitioning ? 0.3 : isOpen ? 1 : 0,
          }}
        >
          {/* Horizontal line */}
          <line
            x1="0"
            y1={menuSize / 2}
            x2={menuSize}
            y2={menuSize / 2}
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          {/* Vertical line */}
          <line
            x1={menuSize / 2}
            y1="0"
            x2={menuSize / 2}
            y2={menuSize}
            stroke="rgba(6, 182, 212, 0.25)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Radial lines connecting center to items */}
        <svg
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 delay-300 ease-linear"
          style={{
            width: menuSize,
            height: menuSize,
            opacity: isTransitioning ? 0 : isOpen ? 1 : 0,
          }}
        >
          {itemPositions.map((pos, index) => {
            const center = menuSize / 2
            const endX = center + pos.x
            const endY = center + pos.y

            return (
              <line
                key={`line-${index}`}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="rgba(6, 182, 212, 0.4)"
                strokeWidth="1.5"
                className={cn(
                  'transition-all duration-300 delay-300 ease-linear',
                  hoveredIndex === index && !isTransitioning && 'stroke-cyan-400 stroke-[2.5px]',
                )}
                style={{
                  filter:
                    hoveredIndex === index && !isTransitioning ? 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))' : 'none',
                }}
              />
            )
          })}
        </svg>

        {/* Back button - shown when in profile menu */}
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className={cn(
              'absolute w-12 h-12 rounded-lg z-25',
              'bg-surface-elevated/95 backdrop-blur-md border-2',
              'border-neural-primary/50 shadow-lg shadow-neural',
              'flex items-center justify-center',
              'transition-all duration-400 ease-out',
              'hover:scale-110 hover:z-30 hover:border-neural-primary-hover hover:shadow-xl hover:shadow-neural-accent',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-neural-primary/50 focus-visible:ring-offset-2',
              'focus-visible:ring-offset-surface-base',
            )}
            style={{
              left: `${menuSize / 2 - 24}px`,
              top: `${menuSize / 2 - 24}px`,
              transform: isOpen && !isTransitioning ? 'scale(1)' : 'scale(0)',
              opacity: isTransitioning ? 0 : 1,
              transitionDelay: isTransitioning ? '0ms' : '200ms',
            }}
            aria-label="Back"
          >
            <div className="absolute inset-0 bg-neural-primary/10 rounded-lg blur-lg" />
            <ArrowLeft className="relative z-10 w-5 h-5 text-neural-primary-hover" />
          </button>
        )}

        {/* Center button - Home (when not in profile menu) */}
        {centerItem &&
          !showBackButton &&
          (() => {
            const Icon = centerItem.icon
            const isActive = pathname === centerItem.href && !centerItem.action

            if (centerItem.action) {
              return (
                <button
                  onClick={(e: React.MouseEvent) => handleItemClick(centerItem, e)}
                  className={cn(
                    'absolute w-14 h-14 rounded-lg z-25',
                    'bg-surface-elevated/95 backdrop-blur-md border-2',
                    'flex items-center justify-center',
                    'transition-all duration-400 ease-out',
                    'hover:scale-110 hover:z-30',
                    'focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-neural-primary/50 focus-visible:ring-offset-2',
                    'focus-visible:ring-offset-surface-base',
                    'border-neural-primary/50 shadow-lg shadow-neural hover:border-neural-primary-hover hover:shadow-xl hover:shadow-neural-accent',
                  )}
                  style={{
                    left: `${menuSize / 2 - 28}px`,
                    top: `${menuSize / 2 - 28}px`,
                    transform: isOpen && !isTransitioning ? 'scale(1)' : 'scale(0)',
                    opacity: isTransitioning ? 0 : 1,
                    transitionDelay: isTransitioning ? '0ms' : '100ms',
                  }}
                  aria-label={centerItem.label}
                >
                  <div
                    className={cn(
                      'absolute inset-0 rounded-lg blur-lg transition-opacity duration-300',
                      'bg-neural-primary/10 opacity-50',
                    )}
                  />
                  <Icon className="relative z-10 w-6 h-6 text-neural-primary-hover" />
                </button>
              )
            }

            return (
              <Link
                href={centerItem.href}
                onClick={(e: React.MouseEvent) => handleItemClick(centerItem, e)}
                className={cn(
                  'absolute w-14 h-14 rounded-lg z-25',
                  'bg-surface-elevated/95 backdrop-blur-md border-2',
                  'flex items-center justify-center',
                  'transition-all duration-400 ease-out',
                  'hover:scale-110 hover:z-30',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-neural-primary/50 focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-surface-base',
                  isActive
                    ? 'border-neural-primary-hover shadow-xl shadow-neural-accent bg-neural-primary/25'
                    : 'border-neural-primary/50 shadow-lg shadow-neural hover:border-neural-primary-hover hover:shadow-xl hover:shadow-neural-accent',
                )}
                style={{
                  left: `${menuSize / 2 - 28}px`,
                  top: `${menuSize / 2 - 28}px`,
                  transform: isOpen && !isTransitioning ? 'scale(1)' : 'scale(0)',
                  opacity: isTransitioning ? 0 : 1,
                  transitionDelay: isTransitioning ? '0ms' : '100ms',
                }}
                aria-label={centerItem.label}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-lg blur-lg transition-opacity duration-300',
                    isActive ? 'bg-neural-primary/20 opacity-100' : 'bg-neural-primary/10 opacity-50',
                  )}
                />
                <Icon className="relative z-10 w-6 h-6 text-neural-primary-hover" />
              </Link>
            )
          })()}

        {/* Menu items */}
        {radialItems.map((item, index) => {
          const Icon = item.icon
          const pos = itemPositions[index]
          const isActive = pathname === item.href && !item.action
          const isHovered = hoveredIndex === index && !isTransitioning
          const isLogout = item.action === 'logout'

          const itemKey = `${item.href}-${item.action || 'none'}-${showBackButton ? 'profile' : 'main'}-${index}`

          const commonProps = {
            onMouseEnter: () => !isTransitioning && setHoveredIndex(index),
            onMouseLeave: () => setHoveredIndex(null),
            className: cn(
              'absolute w-16 h-16 rounded-full z-20',
              'bg-surface-elevated/95 backdrop-blur-md border-2',
              'flex flex-col items-center justify-center gap-1',
              'transition-all duration-400 ease-out',
              'hover:scale-115 hover:z-30',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-neural-primary/50 focus-visible:ring-offset-2',
              'focus-visible:ring-offset-surface-base',
              isActive
                ? 'border-neural-primary-hover shadow-lg shadow-neural-accent bg-neural-primary/20'
                : isLogout
                ? 'border-status-error/50 shadow-lg hover:border-status-error hover:shadow-xl'
                : 'border-neural-primary/50 shadow-lg shadow-neural',
              isHovered && !isLogout && 'border-neural-primary-hover shadow-xl shadow-neural-accent scale-115 bg-neural-primary/30',
              isHovered && isLogout && 'border-status-error shadow-xl scale-115 bg-status-error/20',
            ),
            style: {
              left: `${menuSize / 2 + pos.x - itemSize / 2}px`,
              top: `${menuSize / 2 + pos.y - itemSize / 2}px`,
              transform:
                isOpen && !isTransitioning
                  ? `translate(0, 0) scale(${isHovered ? 1.15 : 1})`
                  : 'translate(0, 0) scale(0)',
              opacity: isTransitioning ? 0 : isOpen ? 1 : 0,
              transitionDelay: isTransitioning ? '0ms' : `${index * 50 + 100}ms`,
            },
            'aria-label': item.label,
          }

          if (isLogout) {
            return (
              <button key={itemKey} {...commonProps} onClick={(e: React.MouseEvent) => handleItemClick(item, e)}>
                {/* Glow effect */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-full blur-xl transition-opacity duration-300',
                    isHovered && isLogout ? 'bg-status-error/30 opacity-100' : 'bg-neural-primary/10 opacity-50',
                  )}
                />

                {/* Icon */}
                <Icon
                  className={cn(
                    'relative z-10 w-6 h-6 transition-colors duration-300',
                    isHovered && isLogout ? 'text-status-error' : 'text-status-error/70',
                  )}
                />

                {/* Label - Always visible */}
                <div
                  className={cn(
                    'absolute -bottom-9 px-2.5 py-1 rounded-md z-40',
                    'bg-surface-elevated/98 border pointer-events-none whitespace-nowrap',
                    'text-xs font-mono uppercase tracking-wider',
                    'backdrop-blur-md shadow-lg',
                    'transition-all duration-300',
                    isHovered && isLogout && 'text-status-error border-status-error/80 scale-110',
                    'border-status-error/50 text-status-error',
                  )}
                  style={{
                    transform: `translateX(${pos.x > 0 ? '-50%' : pos.x < 0 ? '50%' : '0'})`,
                    opacity: isTransitioning ? 0 : 1,
                    transitionDelay: isTransitioning ? '0ms' : `${index * 50 + 100}ms`,
                  }}
                >
                  {item.label}
                </div>
              </button>
            )
          }

          return (
            <Link
              key={itemKey}
              {...commonProps}
              href={item.href}
              onClick={(e: React.MouseEvent) => handleItemClick(item, e)}
            >
              {/* Glow effect */}
              <div
                className={cn(
                  'absolute inset-0 rounded-full blur-xl transition-opacity duration-300',
                  isActive || (isHovered && !isLogout) ? 'bg-neural-primary/40 opacity-100' : 'bg-neural-primary/10 opacity-50',
                )}
              />

              {/* Icon */}
              <Icon
                className={cn(
                  'relative z-10 w-6 h-6 transition-colors duration-300',
                  isActive || (isHovered && !isLogout) ? 'text-neural-primary-light' : 'text-neural-primary/70',
                )}
              />

              {/* Label - Always visible */}
              <div
                className={cn(
                  'absolute -bottom-9 px-2.5 py-1 rounded-md z-40',
                  'bg-surface-elevated/98 border pointer-events-none whitespace-nowrap',
                  'text-xs font-mono uppercase tracking-wider',
                  'backdrop-blur-md shadow-lg',
                  'transition-all duration-300',
                  isHovered && !isLogout && 'text-neural-primary-light border-neural-primary-hover/80 scale-110',
                  isActive && 'text-neural-primary-light border-neural-primary-hover/80',
                  'border-neural-primary/50 text-neural-primary-hover',
                )}
                style={{
                  transform: `translateX(${pos.x > 0 ? '-50%' : pos.x < 0 ? '50%' : '0'})`,
                  opacity: isTransitioning ? 0 : 1,
                  transitionDelay: isTransitioning ? '0ms' : `${index * 50 + 100}ms`,
                }}
              >
                {item.label}
              </div>
            </Link>
          )
        })}

        {/* Scanline effect overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 z-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.1) 2px, rgba(6, 182, 212, 0.1) 4px)',
            width: menuSize,
            height: menuSize,
            borderRadius: '50%',
            maskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 100%)',
          }}
        />
      </div>

      {/* CSS Animation for pulsing glow */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: inset 0 0 50px rgba(6, 182, 212, 0.15), 0 0 80px rgba(6, 182, 212, 0.25),
              0 8px 32px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: inset 0 0 60px rgba(6, 182, 212, 0.2), 0 0 100px rgba(6, 182, 212, 0.35),
              0 8px 32px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </>
  )
}
