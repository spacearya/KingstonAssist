import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import TabNavigation from '../components/TabNavigation'
import ServiceCard from '../components/ServiceCard'
// HOOK_BACKEND_HERE: Replace with API fetch when web-scraped JSON is available
import servicesData from '../data/services.json'

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState('restaurants')

  const items = useMemo(() => {
    const key = activeTab
    return servicesData[key] ?? []
  }, [activeTab])

  return (
    <Layout>
      <motion.div
        className="px-4 py-8 md:px-8 md:py-12 max-w-6xl mx-auto"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <h1 className="font-[var(--font-serif)] text-3xl md:text-4xl font-bold text-slate-deep mb-2">
          Kingston Discovery
        </h1>
        <p className="text-slate-deep/70 mb-8">
          Local restaurants, places to visit, real-time activities, and local artifacts.
        </p>

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((item) => (
            <ServiceCard key={item.id} item={item} />
          ))}
        </div>
        {items.length === 0 && (
          <p className="text-slate-deep/60 text-center py-12">
            No items in this category yet. HOOK_BACKEND_HERE for live data.
          </p>
        )}
      </motion.div>
    </Layout>
  )
}
