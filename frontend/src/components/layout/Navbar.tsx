import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe2, Menu, X, Settings, Clock, Home, Languages } from 'lucide-react'
import { cn } from '@/utils'

const NAV_LINKS = [
  { to: '/',         label: 'Home',      icon: Home },
  { to: '/translate', label: 'Translate', icon: Languages },
  { to: '/history',  label: 'History',   icon: Clock },
  { to: '/settings', label: 'Settings',  icon: Settings },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-xl border-b border-violet-500/10" />

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 group"
          aria-label="PolyVoice AI home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow group-hover:shadow-glow transition-shadow">
            <Globe2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-gradient">PolyVoice</span>
            <span className="text-slate-400 font-light ml-1">AI</span>
          </span>
        </button>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/translate')}
            className="btn-primary text-sm py-2 px-5"
          >
            Start Translating
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative md:hidden bg-navy-900/95 backdrop-blur-xl border-b border-violet-500/10 overflow-hidden"
          >
            <ul className="flex flex-col px-4 py-3 gap-1" role="list">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-violet-500/15 text-violet-300'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="pt-2">
                <button
                  onClick={() => { navigate('/translate'); setMobileOpen(false) }}
                  className="btn-primary w-full justify-center text-sm"
                >
                  Start Translating
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
