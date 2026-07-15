'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, Trophy, type LucideIcon } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import RadialMenu from './RadialMenu'
import { cn } from '@/lib/utils'
import { BrandLogo } from './BrandLogo'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.HOME, label: 'Generator', icon: Home },
  { href: ROUTES.HALL_OF_SHAME, label: 'Hall of Shame', icon: Trophy },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuToggle = useCallback(() => setMenuOpen((open) => !open), [])
  const handleMenuClose = useCallback(() => setMenuOpen(false), [])

  const mobileItems = useMemo(() => NAV_ITEMS.filter((item) => item.href !== ROUTES.HOME && item.href !== pathname), [pathname])
  const homeItem = NAV_ITEMS[0]

  return (
    <>
      <nav aria-label="Primary navigation" className="fixed inset-x-0 top-0 z-50 border-b border-elevated/50 bg-surface-base/95 shadow-lg backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            <BrandLogo href={ROUTES.HOME} size="sm" />

            <div className="hidden items-center gap-2 md:flex">
              {NAV_ITEMS.slice(1).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-[color,background-color,border-color,box-shadow] duration-200',
                      isActive
                        ? 'border-neural-primary/30 bg-neural-primary/10 text-neural-primary-hover shadow-lg'
                        : 'border-transparent text-secondary hover:border-neural-primary/20 hover:bg-surface-overlay/50 hover:text-neural-primary-hover',
                    )}
                  >
                    <Icon aria-hidden="true" className={cn('h-4 w-4', isActive ? 'text-neural-primary-hover' : 'text-muted')} />
                    <span className="relative text-xs uppercase tracking-wider">{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <button
              onClick={handleMenuToggle}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-lg border-2 border-neural-primary/50 bg-surface-elevated/95 shadow-lg shadow-neural transition-[background-color,border-color,box-shadow,transform] duration-200 md:hidden',
                'hover:scale-105 hover:border-neural-primary-hover/70 hover:bg-surface-overlay/95 hover:shadow-neural-accent active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neural-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
                menuOpen && 'border-neural-primary-hover shadow-xl shadow-neural-accent',
              )}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-menu"
              type="button"
            >
              <div className="absolute inset-0 rounded-lg bg-neural-primary/10 blur-lg" />
              <Menu aria-hidden="true" className="relative z-10 h-5 w-5 text-neural-primary-hover" />
            </button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent" />
      </nav>

      <RadialMenu
        items={mobileItems}
        centerItem={homeItem}
        isOpen={menuOpen}
        onClose={handleMenuClose}
        onItemClick={handleMenuClose}
      />
    </>
  )
}
