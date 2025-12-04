'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, Trophy, LogIn, UserPlus, LucideIcon, LogOut, User, Settings, Menu, X } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import UserDropdown from './UserDropdown'
import RadialMenu from './RadialMenu'
import { cn } from '@/lib/utils'
import { BrandLogo } from './BrandLogo'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  action?: 'logout' | 'profile-menu'
}

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Base navigation items
  const baseItems = useMemo<NavItem[]>(() => [{ href: ROUTES.HALL_OF_SHAME, label: 'Hall of Shame', icon: Trophy }], [])

  // Profile menu items (shown when profile icon is clicked)
  const profileMenuItems = useMemo<NavItem[]>(
    () => [
      { href: ROUTES.PROFILE_PAGE, label: 'Profile', icon: User },
      { href: ROUTES.SETTINGS_PAGE, label: 'Settings', icon: Settings },
      { href: '#', label: 'Logout', icon: LogOut, action: 'logout' },
    ],
    [],
  )

  // Desktop navigation items
  const desktopNavItems = useMemo<NavItem[]>(() => {
    if (user) {
      return baseItems
    } else {
      return [...baseItems, { href: ROUTES.LOGIN_PAGE, label: 'Login', icon: LogIn }]
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
        { href: ROUTES.LOGIN_PAGE, label: 'Login', icon: LogIn },
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
        if (item.href === ROUTES.PROFILE_PAGE) {
          return true // Keep profile menu trigger
        }
        return pathname !== item.href
      })
      return filtered
    } else {
      const isOnLoginPage = pathname === ROUTES.LOGIN_PAGE

      return allMainNavItems.filter((item) => {
        // Don't include Home (it's in center)
        if (item.href === ROUTES.HOME) {
          return false
        }
        // Don't include active item
        if (item.href === ROUTES.LOGIN_PAGE) {
          return !isOnLoginPage
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-base/95 backdrop-blur-md border-b border-elevated/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <BrandLogo href="/" size="sm" />

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {desktopNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname.includes(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'text-neural-primary-hover bg-neural-primary/10 border border-neural-primary/30 shadow-lg'
                        : 'text-secondary hover:text-neural-primary-hover hover:bg-surface-overlay/50 border border-transparent hover:border-neural-primary/20',
                    )}
                  >
                    {isActive && <div className="absolute inset-0 bg-neural-primary/5 rounded-lg animate-pulse"></div>}
                    <Icon className={cn('w-4 h-4', isActive ? 'text-neural-primary-hover' : 'text-muted')} />
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
                'bg-surface-elevated/95 backdrop-blur-md border-2',
                'border-neural-primary/50 shadow-lg shadow-neural',
                'flex items-center justify-center',
                'transition-all duration-200',
                'hover:bg-surface-overlay/95 hover:border-neural-primary-hover/70',
                'hover:shadow-neural-accent hover:scale-105',
                'active:scale-95',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-neural-primary/50 focus-visible:ring-offset-2',
                'focus-visible:ring-offset-surface-base',
                menuOpen && 'border-neural-primary-hover shadow-xl shadow-neural-accent',
              )}
              aria-label="Toggle menu"
              type="button"
            >
              <div className="absolute inset-0 bg-neural-primary/10 rounded-lg blur-lg" />
              <Menu className="relative z-10 w-5 h-5 text-neural-primary-hover" />
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
