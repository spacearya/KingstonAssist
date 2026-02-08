import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import { finalizeAccount } from '../lib/api'

const inputBase =
  'w-full rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] bg-white/80 px-4 py-3 text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors'

export default function SuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const emailFromState = location.state?.email ?? ''
  const bizName = location.state?.bizName ?? ''

  const [email, setEmail] = useState(emailFromState)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEmail(emailFromState)
  }, [emailFromState])

  useEffect(() => {
    if (!emailFromState) {
      navigate('/partner', { replace: true })
    }
  }, [emailFromState, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      toast.error('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      toast.error('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await finalizeAccount(email.trim(), password)
      await login(email.trim(), password)
      toast.success('Account created!')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.message ?? 'Could not create account.'
      setError(msg)
      if (msg.includes('submit your business details first')) {
        toast.error('Please submit your business details first.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!emailFromState) {
    return (
      <Layout>
        <div className="px-4 py-8 flex items-center justify-center min-h-[40vh]">
          <p className="text-slate-deep/70">Redirecting...</p>
        </div>
      </Layout>
    )
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
          Thanks{bizName ? `, ${bizName}` : ''}!
        </h1>
        <p className="text-slate-deep/70 mb-2">
          Your application is in the queue.
        </p>
        <p className="text-slate-deep/70 mb-8">
          To track your City of Kingston licensing roadmap, create a password below.
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
              readOnly
              className={`${inputBase} bg-slate-100 cursor-not-allowed`}
              aria-readonly="true"
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
              minLength={6}
              autoComplete="new-password"
              className={inputBase}
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
              <Lock className="w-4 h-4" /> Confirm password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
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
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account…
              </>
            ) : (
              'Create password & go to Dashboard'
            )}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sage font-medium hover:underline">
            Back to home
          </Link>
        </p>
      </motion.div>
    </Layout>
  )
}
