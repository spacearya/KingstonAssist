import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { Home, Compass, Star, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discovery', label: 'Explore Services', icon: Compass },
  { to: '/partner', label: 'Get Featured', icon: Star },
]

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useApp()

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-deep/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed top-0 left-0 h-full w-[min(320px,85vw)] z-50 flex flex-col bg-[var(--color-glass-bg)] backdrop-blur-xl border-l border-[var(--color-glass-border)] shadow-2xl"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="p-6 flex items-center justify-between border-b border-[var(--color-glass-border)]">
              <h2 className="font-[var(--font-serif)] text-xl font-bold text-slate-deep">
                Kingston Hub
              </h2>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 rounded-[var(--radius-xl)] hover:bg-white/50 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-deep" />
              </button>
            </div>
            <nav className="p-6 flex flex-col gap-2">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-[var(--radius-xl)] font-medium transition-colors ${
                      isActive
                        ? 'bg-sage/20 text-sage'
                        : 'text-slate-deep hover:bg-white/50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
