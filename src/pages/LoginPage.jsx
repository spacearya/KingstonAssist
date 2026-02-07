import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Layout, { pageVariants, pageTransition } from '../components/Layout'

const inputBase =
  'w-full rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] bg-white/80 px-4 py-3 text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email.trim(), password)
      if (result.success) {
        navigate('/')
        return
      }
      setError(result.error ?? 'Login failed.')
    } catch (err) {
      setError(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <motion.div
        className="px-4 py-8 md:px-8 md:py-12 max-w-md mx-auto"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <h1 className="font-[var(--font-serif)] text-3xl md:text-4xl font-bold text-slate-deep mb-2">
          Login
        </h1>
        <p className="text-slate-deep/70 mb-8">
          Sign in with your email to access your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-[var(--radius-xl)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
              <Mail className="w-4 h-4" /> Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputBase}
              placeholder="you@example.com"
              disabled={loading}
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
              <Lock className="w-4 h-4" /> Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputBase}
              placeholder="••••••••"
              disabled={loading}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-xl)] bg-sage text-white hover:bg-sage-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-deep/70">
          All pages remain accessible without logging in. Login is optional for personalized features.
        </p>
        <p className="mt-2 text-center">
          <Link to="/" className="text-sage font-medium hover:underline">
            Back to home
          </Link>
        </p>
      </motion.div>
    </Layout>
  )
}
