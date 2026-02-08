import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Lock, Upload, Loader2, ExternalLink, Mail } from 'lucide-react'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { getDashboardData, updateProgress, uploadLicense } from '../lib/api'

const licensingSteps = [
  {
    id: 1,
    title: 'Join AnangAI Community',
    subtitle: 'Your digital home is ready.',
    whyItMatters: 'You’re part of the partner pipeline and can track your licensing journey here.',
    autoDone: true,
    action: null,
  },
  {
    id: 2,
    title: 'Initial Consultation',
    subtitle: 'Speak to a Licensing Agent (613-546-4291 ext. 3150) or email licensingapplications@cityofkingston.ca.',
    whyItMatters: 'The City confirms your business type and required permits before you invest time in other steps.',
    action: { type: 'mailto', label: 'Draft Consultation Email', href: 'mailto:licensingapplications@cityofkingston.ca?subject=Business%20Licensing%20Consultation' },
  },
  {
    id: 3,
    title: 'Provincial Registration',
    subtitle: 'Register your Business Name at Service Ontario (1201 Division St).',
    whyItMatters: 'Your business must be registered provincially before the City can issue a local license.',
    action: { type: 'link', label: 'Open ServiceOntario Portal', href: 'https://www.ontario.ca/page/business-services' },
  },
  {
    id: 4,
    title: 'Zoning Verification',
    subtitle: 'Check if your location is zoned for your business type via Kingston Planning Dept.',
    whyItMatters: 'Zoning ensures your address is permitted for your use—required before final license approval.',
    action: { type: 'link', label: 'Open Kingston Zoning Map', href: 'https://www.cityofkingston.ca/planning-and-development/zoning-bylaws/zoning-bylaw-map/' },
  },
  {
    id: 5,
    title: 'Tax (HST) Setup',
    subtitle: 'Register for your HST number with the Canada Revenue Agency (CRA).',
    whyItMatters: 'Many business licenses require proof of HST registration for tax compliance.',
    action: { type: 'link', label: 'Open CRA Business Portal', href: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/registering-your-business.html' },
  },
  {
    id: 6,
    title: 'Safety Clearances',
    subtitle: 'Gather Fire & Health inspection documents for your specific business type.',
    whyItMatters: 'Safety clearances protect you and your customers and are required for license issuance.',
    action: { type: 'link', label: 'View Fire Safety Checklists', href: 'https://www.cityofkingston.ca/residents/fire-emergency-services/fire-prevention' },
  },
  {
    id: 7,
    title: 'GO LIVE',
    subtitle: 'Upload your final City Business License PDF to unlock your public profile.',
    whyItMatters: 'Once verified, your business appears on KingstonAI for visitors and locals to discover.',
    action: { type: 'upload', label: 'Upload & Verify' },
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const email = user?.email

  useEffect(() => {
    if (!user) return
    if (!email) {
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    getDashboardData(email)
      .then((data) => { if (!cancelled) setProfile(data) })
      .catch(() => { if (!cancelled) setProfile({ auth: { progress: 1, is_verified: false }, business: {} }) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user, email, navigate])

  const auth = profile?.auth ?? {}
  const business = profile?.business ?? {}
  const progress = auth.progress ?? 1
  const isVerified = auth.is_verified ?? false
  const step7Unlocked = progress >= 6
  const hasApplication = !!(business && (business.biz_name || business.biz_cat || business.status))
  const needsLicense = hasApplication && !business.license_url && !isVerified

  const handleMarkDone = async (stepId) => {
    if (stepId === 1 || stepId > 6) return
    if (progress >= stepId) return
    try {
      const next = await updateProgress(email, stepId)
      setProfile((p) => ({ ...p, auth: { ...(p?.auth ?? {}), progress: next.progress } }))
      toast.success('Step completed!')
    } catch (e) {
      toast.error(e.message ?? 'Could not update')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !email) return
    setUploading(true)
    try {
      await uploadLicense(email, file)
      setProfile((p) => ({ ...p, auth: { ...(p?.auth ?? {}), progress: 7, is_verified: true }, business: { ...(p?.business ?? {}), license_url: true } }))
      setUploadSuccess(true)
      toast.success('License uploaded! You are now verified.')
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
      setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } }), 200)
    } catch (err) {
      toast.error(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-sage animate-spin" />
        </div>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-sage animate-spin" />
        </div>
      </Layout>
    )
  }

  const status = user.status || auth.status || 'approved'
  if (status === 'pending_review') {
    return (
      <Layout>
        <div className="px-4 py-8 md:px-8 md:py-12 max-w-2xl mx-auto text-center">
          <div className="rounded-[var(--radius-2xl)] bg-[var(--color-glass-bg)] backdrop-blur-xl border border-[var(--color-glass-border)] p-8 md:p-12">
            <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-sage animate-spin" />
            </div>
            <h1 className="font-[var(--font-serif)] text-2xl md:text-3xl font-bold text-slate-deep mb-3">
              Verification in Progress
            </h1>
            <p className="text-slate-deep/80">
              Our team is verifying your local status. You will be able to access your Roadmap once approved.
            </p>
            <p className="text-sm text-slate-deep/60 mt-4">
              Check back later or contact support if you have questions.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  if (status === 'rejected') {
    return (
      <Layout>
        <div className="px-4 py-8 md:px-8 md:py-12 max-w-2xl mx-auto text-center">
          <div className="rounded-[var(--radius-2xl)] bg-slate-50 border border-slate-200 p-8 md:p-12">
            <h1 className="font-[var(--font-serif)] text-2xl md:text-3xl font-bold text-slate-deep mb-3">
              Application Not Approved
            </h1>
            <p className="text-slate-deep/80">
              Your application could not be approved at this time. Please contact us if you believe this is an error.
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-8 md:px-8 md:py-12 max-w-3xl mx-auto">
        <h1 className="font-[var(--font-serif)] text-3xl md:text-4xl font-bold text-slate-deep mb-2">
          Partner Roadmap
        </h1>
        <p className="text-slate-deep/70 mb-10">
          City of Kingston licensing steps. Complete each in order and check it off as you go.
        </p>

        {needsLicense && (
          <div className="rounded-[var(--radius-2xl)] bg-amber-50/90 backdrop-blur-xl border border-amber-200 p-5 mb-8">
            <p className="font-medium text-amber-900 mb-2">Upload your City Business License</p>
            <p className="text-sm text-amber-800/90 mb-3">
              Your application is in the queue but has no license file yet. Upload your official City Business License PDF to unlock your public profile.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-xl)] bg-sage text-white text-sm font-medium cursor-pointer hover:bg-sage-light transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload license'}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="sr-only"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </div>
        )}

        {/* Tube Map / Progress Line */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-6 bottom-6 w-0.5 rounded-full bg-slate-200"
            aria-hidden="true"
          />
          <div
            className="absolute left-5 top-6 w-0.5 rounded-full bg-sage transition-all duration-500"
            style={{ height: `${(Math.min(progress, 6) / 6) * 100}%`, maxHeight: 'calc(100% - 3rem)' }}
            aria-hidden="true"
          />

          <ul className="space-y-0">
            {licensingSteps.map((step, index) => {
              const done = step.autoDone || (step.id < 7 && progress >= step.id) || (step.id === 7 && (isVerified || uploadSuccess))
              const isStep7 = step.id === 7
              const locked = isStep7 && !step7Unlocked
              const canCheck = !isStep7 && !step.autoDone && progress < step.id

              return (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-6 pb-10 last:pb-0"
                >
                  {/* Node */}
                  <div
                    className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done
                        ? 'bg-sage border-sage text-white'
                        : locked
                          ? 'bg-slate-200 border-slate-300 text-slate-400'
                          : 'bg-white border-[var(--color-glass-border)] text-slate-deep shadow-sm'
                    }`}
                  >
                    {done ? <Check className="w-5 h-5" /> : locked ? <Lock className="w-5 h-5" /> : step.id}
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 min-w-0 rounded-[var(--radius-2xl)] border backdrop-blur-xl p-4 md:p-5 transition-all ${
                      done
                        ? 'bg-green-50/80 border-green-200'
                        : locked
                          ? 'bg-slate-50/80 border-slate-200 opacity-90'
                          : 'bg-[var(--color-glass-bg)] border-[var(--color-glass-border)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className={`font-[var(--font-serif)] font-bold text-lg ${done ? 'text-green-800' : locked ? 'text-slate-400' : 'text-slate-deep'}`}>
                          {step.title}
                        </h2>
                        <p className={`text-sm mt-0.5 ${done ? 'text-green-700/90' : locked ? 'text-slate-400' : 'text-slate-deep/80'}`}>
                          {step.subtitle}
                        </p>
                        <p className="text-xs text-slate-deep/60 mt-2 italic" title="Why it matters">
                          Why it matters: {step.whyItMatters}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {step.action?.type === 'link' && (
                          <a
                            href={step.action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-xl)] bg-white/80 border border-[var(--color-glass-border)] text-slate-deep text-sm font-medium hover:bg-white hover:border-sage/40 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {step.action.label}
                          </a>
                        )}
                        {step.action?.type === 'mailto' && (
                          <a
                            href={step.action.href}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-xl)] bg-white/80 border border-[var(--color-glass-border)] text-slate-deep text-sm font-medium hover:bg-white hover:border-sage/40 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                            {step.action.label}
                          </a>
                        )}
                        {step.action?.type === 'upload' && (
                          <>
                            {locked ? (
                              <span className="text-sm text-slate-400">Complete steps 1–6 to unlock</span>
                            ) : isVerified || uploadSuccess ? (
                              <span className="text-sm font-medium text-green-700">Verified & LIVE</span>
                            ) : (
                              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-xl)] bg-sage text-white text-sm font-medium cursor-pointer hover:bg-sage-light transition-colors">
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Uploading…' : step.action.label}
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                                  className="sr-only"
                                  onChange={handleUpload}
                                  disabled={uploading}
                                />
                              </label>
                            )}
                          </>
                        )}
                        {canCheck && (
                          <button
                            type="button"
                            onClick={() => handleMarkDone(step.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-xl)] bg-sage text-white text-sm font-medium hover:bg-sage-light transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Mark as done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </div>

        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 rounded-[var(--radius-2xl)] bg-green-50/90 backdrop-blur-xl border border-green-200 p-6 text-center"
          >
            <p className="font-[var(--font-serif)] font-bold text-green-800 text-lg">
              Congratulations! Your business is now LIVE on KingstonAI.
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
