import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, Leaf, Info, ExternalLink } from 'lucide-react'
import CertificationLeaves from './CertificationLeaves'

export default function DiscoveryCard({ entry, type }) {
  const { name, location, url, hours, fees, about, notes, local_sourcing, veg_vegan, certification, date, venue } = entry

  return (
    <motion.article
      className="rounded-[var(--radius-2xl)] bg-white/70 backdrop-blur-sm border border-[var(--color-glass-border)] p-5 md:p-6 shadow-sm hover:shadow-md hover:border-sage/30 transition-all duration-300"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-[var(--font-serif)] font-bold text-lg md:text-xl text-slate-deep flex-1">
          {name}
        </h3>
      </div>

      {/* Location */}
      {location && (
        <div className="flex items-start gap-2 text-slate-deep/80 text-sm mb-3">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-sage" />
          <span className="flex-1">{location}</span>
        </div>
      )}

      {/* Description/About/Notes */}
      {(about || notes) && (
        <p className="text-slate-deep/70 text-sm mb-3 leading-relaxed">
          {about || notes}
        </p>
      )}

      {/* Event-specific: Date and Venue */}
      {type === 'events' && (
        <>
          {date && (
            <div className="flex items-center gap-2 text-slate-deep/80 text-sm mb-2">
              <Clock className="w-4 h-4 shrink-0 text-sage" />
              <span>{date}</span>
            </div>
          )}
          {venue && (
            <div className="flex items-center gap-2 text-slate-deep/80 text-sm mb-2">
              <Info className="w-4 h-4 shrink-0 text-sage" />
              <span>{venue}</span>
            </div>
          )}
        </>
      )}

      {/* Hours */}
      {hours && (
        <div className="flex items-start gap-2 text-slate-deep/70 text-sm mb-2">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-sage" />
          <span className="flex-1">{hours}</span>
        </div>
      )}

      {/* Fees */}
      {fees && (
        <div className="flex items-center gap-2 text-slate-deep/70 text-sm mb-2">
          <DollarSign className="w-4 h-4 shrink-0 text-sage" />
          <span>{fees}</span>
        </div>
      )}

      {/* Food-specific: Local Sourcing, Veg/Vegan, Certification */}
      {type === 'food' && (
        <div className="space-y-2 mb-3">
          {local_sourcing && (
            <div className="flex items-center gap-2 text-sage text-sm">
              <Leaf className="w-4 h-4 shrink-0" />
              <span>{local_sourcing}</span>
            </div>
          )}
          {veg_vegan && (
            <div className="flex items-center gap-2 text-slate-deep/70 text-sm">
              <Leaf className="w-4 h-4 shrink-0 text-sage" />
              <span>Veg/Vegan: {veg_vegan}</span>
            </div>
          )}
          {certification && certification !== 'null' && (
            <div className="flex items-center gap-2 text-sage text-sm">
              <CertificationLeaves certification={certification} />
              <span className="text-slate-deep/70">Green Plate Certified</span>
            </div>
          )}
        </div>
      )}

      {/* Location Button */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-xl bg-gradient-to-br from-sage to-sage-light text-white hover:from-sage-light hover:to-sage transition-all shadow-sm hover:shadow-md text-sm font-medium"
        >
          <MapPin className="w-4 h-4" />
          <span>Find Location</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </motion.article>
  )
}

