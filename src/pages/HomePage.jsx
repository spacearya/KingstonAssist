import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import ChatInterface from '../components/ChatInterface'

export default function HomePage() {
  return (
    <Layout>
      <motion.div
        className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-4 py-12 md:py-16"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <motion.h1
          className="font-[var(--font-serif)] text-4xl md:text-6xl lg:text-7xl font-bold text-slate-deep text-center max-w-4xl leading-tight mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Welcome to, KingstonAI
        </motion.h1>
        <motion.p
          className="text-slate-deep/70 text-lg md:text-xl mb-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          Sustainable tourism — local produce, places & activities
        </motion.p>

        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className="rounded-[var(--radius-2xl)] bg-white/60 backdrop-blur-md border border-[var(--color-glass-border)] shadow-lg p-4 md:p-6 focus-within:ring-2 focus-within:ring-sage/40 focus-within:border-sage transition-all duration-300 focus-within:shadow-xl pulse-ring-on-focus">
            <div className="flex items-center gap-2 text-slate-deep/70 mb-3">
              <Search className="w-5 h-5 text-sage" />
              <span className="text-sm font-medium">AI trip assistant</span>
            </div>
            <ChatInterface />
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  )
}
