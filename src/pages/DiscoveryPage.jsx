import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import TabNavigation from '../components/TabNavigation'
import DiscoveryCard from '../components/DiscoveryCard'
import { getDiscoveryCategories, getDiscoveryData } from '../lib/api'

export default function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState(null)
  const [categories, setCategories] = useState([])
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)

  // Load categories on mount
  useEffect(() => {
    getDiscoveryCategories()
      .then((data) => {
        const cats = data.categories ?? []
        setCategories(cats)
        // Set first category as active if available
        if (cats.length > 0 && !activeTab) {
          setActiveTab(cats[0].id)
        }
      })
      .catch((e) => {
        setError(e.message)
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  // Load data when active tab changes
  useEffect(() => {
    if (!activeTab) return

    setLoadingData(true)
    setError(null)
    getDiscoveryData(activeTab)
      .then((data) => {
        setEntries(data.entries ?? [])
      })
      .catch((e) => {
        setError(e.message)
        setEntries([])
      })
      .finally(() => setLoadingData(false))
  }, [activeTab])

  // Get current category type for cards
  const currentCategoryType = useMemo(() => {
    const cat = categories.find((c) => c.id === activeTab)
    return cat?.type || 'food'
  }, [categories, activeTab])

  // Format tabs for navigation
  const tabs = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
    }))
  }, [categories])

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
          Explore
        </h1>
        <p className="text-slate-deep/70 mb-8">
          Explore local restaurants, places to visit, and events in Kingston.
        </p>

        {loading && (
          <p className="text-slate-deep/60 text-center py-12">Loading categories…</p>
        )}
        {error && !loading && (
          <p className="text-red-600 text-center py-4">
            Could not load data. Make sure the API is running on http://localhost:8000
          </p>
        )}

        {!loading && categories.length > 0 && (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

            {loadingData && (
              <p className="text-slate-deep/60 text-center py-12">Loading data…</p>
            )}

            {!loadingData && error && (
              <p className="text-red-600 text-center py-4">Could not load data for this category.</p>
            )}

            {!loadingData && !error && entries.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {entries.map((entry, index) => (
                  <DiscoveryCard
                    key={`${entry.name}-${index}`}
                    entry={entry}
                    type={currentCategoryType}
                  />
                ))}
              </div>
            )}

            {!loadingData && !error && entries.length === 0 && (
              <p className="text-slate-deep/60 text-center py-12">
                No entries found in this category.
              </p>
            )}
          </>
        )}

        {!loading && categories.length === 0 && !error && (
          <p className="text-slate-deep/60 text-center py-12">
            No categories available. Please check your data files.
          </p>
        )}
      </motion.div>
    </Layout>
  )
}
