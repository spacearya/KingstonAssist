import { motion } from 'framer-motion'
import { MapPin, Leaf } from 'lucide-react'

export default function ServiceCard({ item }) {
  const { name, description, sustainability, address, live } = item

  return (
    <motion.article
      className="rounded-[var(--radius-2xl)] bg-white/70 backdrop-blur-sm border border-[var(--color-glass-border)] p-5 md:p-6 shadow-sm hover:shadow-md hover:border-sage/30 transition-all duration-300"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-[var(--font-serif)] font-bold text-lg text-slate-deep">
          {name}
        </h3>
        {live && (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-burnt-sienna/20 text-burnt-sienna text-xs font-semibold uppercase tracking-wide">
            Live
          </span>
        )}
      </div>
      <p className="text-slate-deep/80 text-sm mb-3">{description}</p>
      {sustainability && (
        <div className="flex items-center gap-2 text-sage text-sm mb-2">
          <Leaf className="w-4 h-4 shrink-0" />
          <span>{sustainability}</span>
        </div>
      )}
      {address && (
        <div className="flex items-center gap-2 text-slate-deep/60 text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{address}</span>
        </div>
      )}
    </motion.article>
  )
}
