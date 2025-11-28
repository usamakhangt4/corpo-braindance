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
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

export default function UserDropdown() {
  const { user, signOut } = useAuth()

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

        <DropdownMenuItem
          asChild
          className={cn(
            'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50',
            'cursor-pointer focus:bg-slate-800/50 focus:text-cyan-300',
            'text-xs uppercase tracking-wider',
          )}
        >
          <Link href="/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className={cn(
            'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50',
            'cursor-pointer focus:bg-slate-800/50 focus:text-cyan-300',
            'text-xs uppercase tracking-wider',
          )}
        >
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-700" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className={cn(
            'text-red-400 hover:text-red-300 hover:bg-red-500/10',
            'cursor-pointer focus:bg-red-500/10 focus:text-red-300',
            'text-xs uppercase tracking-wider',
          )}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
