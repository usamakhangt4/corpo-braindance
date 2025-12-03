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
import { useAuthStore } from '@/lib/stores/use-auth-store'

interface DropdownMenuItem {
  label: string
  href: string
  icon: LucideIcon
}

const MENU_ITEM_BASE_CLASSES = 'text-xs uppercase tracking-wider cursor-pointer font-mono transition-colors'
const MENU_ITEM_DEFAULT_CLASSES =
  'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 focus:bg-slate-800/50 focus:text-cyan-300'

export default function UserDropdown() {
  const { user, signOut } = useAuthStore()

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'ml-2 pl-2 border-l border-slate-700',
            'text-slate-400 hover:text-cyan-400',
            'font-mono uppercase tracking-wider text-xs',
            'h-9 px-3',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="hidden sm:inline">{user?.email?.split('@')[0]}</span>
            <ChevronDown className="w-3 h-3 hidden sm:inline" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          'w-56 bg-slate-900/95 border-2 border-cyan-500/30',
          'backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.2)]',
          'font-mono',
        )}
      >
        <DropdownMenuLabel className="text-cyan-400 uppercase tracking-wider text-xs">Neural Profile</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />

        {DROPDOWN_MENU_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild className={cn(MENU_ITEM_BASE_CLASSES, MENU_ITEM_DEFAULT_CLASSES)}>
            <Link href={item.href} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-inherit" />
              <span>{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem onClick={handleSignOut} variant="destructive" className={cn(MENU_ITEM_BASE_CLASSES)}>
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
