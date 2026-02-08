import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import ChatInterface from '../components/ChatInterface'

const heroImage = new URL('../../frontendimages/Kingston City Hall Image 1.jpeg', import.meta.url).href

const waveClipPath = 'polygon(0% 0%, 100% 0%, 100% 65%, 98% 72%, 94% 76%, 88% 80%, 80% 84%, 70% 87%, 55% 90%, 40% 88%, 25% 85%, 15% 82%, 8% 78%, 3% 72%, 0% 65%)'

export default function HomePage() {
  return (
    <Layout>
      <motion.section
        className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-center px-4 py-12 md:py-16 overflow-hidden"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        {/* Liquid / organic wavy image background */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="liquid-float w-full max-w-5xl h-[75vh] max-h-[680px] flex items-center justify-center"
            style={{
              clipPath: waveClipPath,
              WebkitClipPath: waveClipPath,
            }}
          >
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Soft overlay so wave blends into page */}
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 50%, var(--color-cloud-dancer) 100%)',
              }}
            />
          </div>
        </div>

        {/* Content + glass card overlapping the wave */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
          <motion.div
            className="rounded-[var(--radius-2xl)] px-6 py-5 md:px-8 md:py-6 text-center mb-10"
            style={{
              background: 'rgba(255, 255, 255, 0.35)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              border: '1px solid rgba(255,255,255,0.5)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="font-[var(--font-serif)] text-4xl md:text-6xl lg:text-7xl font-bold text-slate-deep max-w-4xl leading-tight mx-auto">
              Welcome to, AnangAI
            </h1>
            <motion.p
              className="text-slate-deep/80 text-lg md:text-xl mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
              Sustainable tourism — local produce, places & activities
            </motion.p>
          </motion.div>

          {/* Frosted glass card overlapping the organic shape */}
          <motion.div
            className="w-full max-w-2xl -mt-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <div
              className="rounded-[var(--radius-2xl)] border border-[var(--color-glass-border)] shadow-xl p-4 md:p-6 focus-within:ring-2 focus-within:ring-sage/40 focus-within:border-sage transition-all duration-300 focus-within:shadow-2xl pulse-ring-on-focus"
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center gap-2 text-slate-deep/70 mb-3">
                <Search className="w-5 h-5 text-sage" />
                <span className="text-sm font-medium">AI trip assistant</span>
              </div>
              <ChatInterface />
            </div>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  )
}
