'use client'

import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { User, Settings, LogOut, ChevronDown, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/profile'

interface DropdownMenuItem {
  label: string
  href: string
  icon: LucideIcon
}

const MENU_ITEM_BASE_CLASSES = 'text-xs uppercase tracking-wider cursor-pointer font-mono transition-colors'
const MENU_ITEM_DEFAULT_CLASSES =
  'text-secondary hover:text-neural-primary-light hover:bg-surface-overlay/50 focus:bg-surface-overlay/50 focus:text-neural-primary-light'

export default function UserDropdown() {
  const { user, signOut } = useAuthStore()
  const [avatarError, setAvatarError] = useState(false)

  // Fetch user profile to get avatar_url
  const { data: profile, isLoading: profileLoading } = useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, username')
        .eq('id', user.id)
        .maybeSingle() // Use maybeSingle() instead of single() to avoid errors

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      if (!data) {
        console.warn('No profile found for user:', user.id)
        return null
      }

      return data as Profile
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const DROPDOWN_MENU_ITEMS: DropdownMenuItem[] = [
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  // Reset avatarError when avatar_url changes
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarError(false)
    }
  }, [profile?.avatar_url])

  // Process Google avatar URL - remove size parameter if present to avoid issues
  const processAvatarUrl = (url: string | null | undefined): string | null => {
    if (!url) return null
    // Google URLs sometimes have size parameters that can cause issues
    // Try the URL as-is first, but we can modify if needed
    return url
  }

  const avatarUrl = processAvatarUrl(profile?.avatar_url)
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'ml-2 pl-2 border-l border-base',
            'text-muted hover:text-neural-primary-hover',
            'font-mono uppercase tracking-wider text-xs',
            'h-9 px-3',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neural-primary/20 border border-neural-primary/30 flex items-center justify-center overflow-hidden relative">
              {avatarUrl && !avatarError ? (
                <img
                  key={avatarUrl}
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error('Avatar image failed to load:', {
                      url: avatarUrl,
                      error: e,
                      profileAvatarUrl: profile?.avatar_url,
                    })
                    setAvatarError(true)
                  }}
                  onLoad={() => {
                    setAvatarError(false)
                  }}
                />
              ) : (
                <User className="w-3.5 h-3.5 text-neural-primary-hover" />
              )}
            </div>
            <span className="hidden sm:inline">{displayName}</span>
            <ChevronDown className="w-3 h-3 hidden sm:inline" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-56 bg-surface-elevated/95 border-2 border-neural-primary/30',
          'backdrop-blur-sm shadow-neural',
          'font-mono',
        )}
      >
        <DropdownMenuLabel className="text-neural-primary-hover uppercase tracking-wider text-xs">
          Neural Profile
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-base" />

        {DROPDOWN_MENU_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild className={cn(MENU_ITEM_BASE_CLASSES, MENU_ITEM_DEFAULT_CLASSES)}>
            <Link href={item.href} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-inherit" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-base" />

        <DropdownMenuItem onClick={handleSignOut} variant="destructive" className={cn(MENU_ITEM_BASE_CLASSES)}>
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
