import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import { signupApi } from '../lib/api'

const inputBase =
  'w-full rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] bg-white/80 px-4 py-3 text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.state?.message

  useEffect(() => {
    if (message) toast.success(message)
  }, [message])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.message ?? 'Login failed.'
      setError(msg)
      if (err.message?.toLowerCase().includes('invalid') || err.message === 'Invalid credentials') {
        toast.error('Invalid Credentials')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
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
      await signupApi(email.trim(), password)
      toast.success('Account created! Logging you in...')
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err.message ?? 'Sign up failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = mode === 'login' ? handleLogin : handleSignup

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
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </h1>
        <p className="text-slate-deep/70 mb-8">
          {mode === 'login'
            ? 'Sign in with your email to access your dashboard.'
            : 'Create an account with your email and password.'}
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
              minLength={mode === 'signup' ? 4 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className={inputBase}
              placeholder="••••••••"
              disabled={loading}
            />
            {mode === 'signup' && (
              <p className="text-xs text-slate-deep/60 mt-1">At least 6 characters</p>
            )}
          </label>
          {mode === 'signup' && (
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                <Lock className="w-4 h-4" /> Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={4}
                autoComplete="new-password"
                className={inputBase}
                placeholder="••••••••"
                disabled={loading}
              />
            </label>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-xl)] bg-sage text-white hover:bg-sage-light disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                Log in
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign up
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-deep/70">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setConfirmPassword(''); }}
                className="text-sage font-medium hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-sage font-medium hover:underline"
              >
                Log in
              </button>
            </>
          )}
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
