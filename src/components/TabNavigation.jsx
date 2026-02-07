import { motion } from 'framer-motion'

const tabs = [
  { id: 'restaurants', label: 'Local Restaurants' },
  { id: 'places', label: 'Places to Visit' },
  { id: 'activities', label: 'Real-time Activities' },
  { id: 'artifacts', label: 'Local Artifacts' },
]

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav
      className="flex flex-wrap gap-2 md:gap-3 mb-8"
      role="tablist"
      aria-label="Discovery categories"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-5 py-2.5 rounded-[var(--radius-xl)] font-medium text-sm transition-colors ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-slate-deep bg-white/60 hover:bg-white/80'
          }`}
        >
          {activeTab === tab.id && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-[var(--radius-xl)] bg-sage z-0"
              transition={{ type: 'tween', duration: 0.25 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
