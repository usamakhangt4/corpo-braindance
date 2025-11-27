'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, FileText } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: ROUTES.HOME, label: 'Generator', icon: Home },
    { href: ROUTES.HALL_OF_SHAME, label: 'Hall of Shame', icon: Trophy },
  ]

  return (
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

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 border border-transparent hover:border-cyan-500/20'
                    }
                  `}
                >
                  {isActive && <div className="absolute inset-0 bg-cyan-500/5 rounded-lg animate-pulse"></div>}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="relative uppercase tracking-wider text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    </nav>
  )
}
