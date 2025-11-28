'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, Trophy, LogIn, UserPlus, LucideIcon, LogOut, User, Settings, Menu, X } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { useAuth } from '@/hooks/use-auth'
import UserDropdown from './UserDropdown'
import RadialMenu from './RadialMenu'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  action?: 'logout' | 'profile-menu'
}

export default function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Base navigation items
  const baseItems = useMemo<NavItem[]>(() => [{ href: ROUTES.HALL_OF_SHAME, label: 'Hall of Shame', icon: Trophy }], [])

  // Profile menu items (shown when profile icon is clicked)
  const profileMenuItems = useMemo<NavItem[]>(
    () => [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '#', label: 'Logout', icon: LogOut, action: 'logout' },
    ],
    [],
  )

  // Desktop navigation items
  const desktopNavItems = useMemo<NavItem[]>(() => {
    if (user) {
      return baseItems
    } else {
      return [
        ...baseItems,
        { href: ROUTES.LOGIN, label: 'Login', icon: LogIn },
        { href: ROUTES.SIGNUP, label: 'Signup', icon: UserPlus },
      ]
    }
  }, [user, baseItems])

  // All possible main navigation items
  const allMainNavItems = useMemo<NavItem[]>(() => {
    if (user) {
      return [
        { href: ROUTES.HOME, label: 'Home', icon: Home },
        ...baseItems,
        { href: '#', label: 'Profile', icon: User, action: 'profile-menu' },
      ]
    } else {
      return [
        { href: ROUTES.HOME, label: 'Home', icon: Home },
        ...baseItems,
        { href: ROUTES.LOGIN, label: 'Login', icon: LogIn },
        { href: ROUTES.SIGNUP, label: 'Signup', icon: UserPlus },
      ]
    }
  }, [user, baseItems])

  // Center item - Only Home (when not in profile menu) or null (back button handled separately)
  const centerItem = useMemo<NavItem | null>(() => {
    // When in profile menu, back button is shown (handled in RadialMenu)
    if (showProfileMenu) return null

    // Always show Home in center
    const homeItem = allMainNavItems.find((item) => item.href === ROUTES.HOME)
    return homeItem || null
  }, [allMainNavItems, showProfileMenu])

  // Main navigation items (filtered - exclude Home since it's in center, and active item)
  const mainNavItems = useMemo<NavItem[]>(() => {
    if (user) {
      const filtered = allMainNavItems.filter((item) => {
        // Don't include Home (it's in center)
        if (item.href === ROUTES.HOME) {
          return false
        }
        // Don't include active item
        if (item.action === 'profile-menu') {
          return true // Keep profile menu trigger
        }
        return pathname !== item.href
      })
      return filtered
    } else {
      const isOnAuthPage = pathname === '/auth'
      const isOnLoginPage =
        isOnAuthPage &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('mode') === 'login'
      const isOnSignupPage =
        isOnAuthPage &&
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('mode') === 'signup'

      return allMainNavItems.filter((item) => {
        // Don't include Home (it's in center)
        if (item.href === ROUTES.HOME) {
          return false
        }
        // Don't include active item
        if (item.href === ROUTES.LOGIN) {
          return !isOnLoginPage
        }
        if (item.href === ROUTES.SIGNUP) {
          return !isOnSignupPage
        }
        return pathname !== item.href
      })
    }
  }, [user, allMainNavItems, pathname])

  // Determine which items to show
  const currentItems = showProfileMenu ? profileMenuItems : mainNavItems

  const handleMenuToggle = useCallback(() => {
    setMenuOpen((prev) => {
      const newState = !prev
      if (!newState) {
        setShowProfileMenu(false)
      }
      return newState
    })
  }, [])

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false)
    setShowProfileMenu(false)
  }, [])

  const handleItemClick = useCallback(
    async (item: NavItem) => {
      if (item.action === 'profile-menu') {
        setShowProfileMenu(true)
      } else if (item.action === 'logout') {
        await signOut()
        handleMenuClose()
      } else {
        handleMenuClose()
      }
    },
    [signOut, handleMenuClose],
  )

  const handleBack = useCallback(() => {
    setShowProfileMenu(false)
  }, [])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50 shadow-lg shadow-cyan-500/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-lg group-hover:bg-cyan-500/30 transition-colors"></div>
                <div className="relative px-3 py-1.5 border border-cyan-500/30 rounded-lg bg-slate-900/50">
                  <span className="text-cyan-400 font-mono text-xs font-bold tracking-wider">CORPO</span>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-xs tracking-[0.3em] hidden sm:inline">//</span>
              <span className="text-pink-400 font-mono text-xs font-bold tracking-wider hidden sm:inline">
                BRAINDANCE
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {desktopNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.includes(item.href) || searchParams.get('mode') === item.href.split('=')[1]

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 border border-transparent hover:border-cyan-500/20',
                    )}
                  >
                    {isActive && <div className="absolute inset-0 bg-cyan-500/5 rounded-lg animate-pulse"></div>}
                    <Icon className={cn('w-4 h-4', isActive ? 'text-cyan-400' : 'text-slate-500')} />
                    <span className="relative uppercase tracking-wider text-xs">{item.label}</span>
                  </Link>
                )
              })}

              {/* User Menu - Show when authenticated */}
              {user && <UserDropdown />}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={handleMenuToggle}
              className={cn(
                'md:hidden w-10 h-10 rounded-lg',
                'bg-slate-900/95 backdrop-blur-md border-2',
                'border-cyan-500/50 shadow-lg shadow-cyan-500/20',
                'flex items-center justify-center',
                'transition-all duration-200',
                'hover:bg-slate-800/95 hover:border-cyan-400/70',
                'hover:shadow-cyan-500/30 hover:scale-105',
                'active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2',
                'focus-visible:ring-offset-slate-950',
                menuOpen && 'border-cyan-400 shadow-xl shadow-cyan-500/40',
              )}
              aria-label="Toggle menu"
              type="button"
            >
              <div className="absolute inset-0 bg-cyan-500/10 rounded-lg blur-lg" />
              <Menu className="relative z-10 w-5 h-5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      </nav>

      {/* Radial Menu - Mobile only */}
      {currentItems.length > 0 && (
        <RadialMenu
          items={currentItems}
          centerItem={centerItem}
          isOpen={menuOpen}
          onClose={handleMenuClose}
          onItemClick={handleItemClick}
          showBackButton={showProfileMenu}
          onBack={handleBack}
        />
      )}
    </>
  )
}
