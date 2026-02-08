import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import { Check, Building2, Mail, FileText, Phone, Loader2, FileCheck } from 'lucide-react'
import { submitApplication } from '../lib/api'

const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Producer', 'Market', 'Other']

const inputBase =
  'w-full rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] bg-white/80 px-4 py-3 text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors'

export default function PartnerPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [licenseFile, setLicenseFile] = useState(null)
  const [form, setForm] = useState({
    email: '',
    businessName: '',
    businessType: '',
    businessDescription: '',
    contact: '',
  })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitApplication(form, licenseFile)
      toast.success('Application received!')
      navigate('/success', { state: { email: form.email.trim(), bizName: form.businessName || form.email } })
    } catch (err) {
      setSubmitError(err.message ?? 'Could not save application.')
      toast.error(err.message ?? 'Could not save application.')
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 3))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <Layout>
      <motion.div
        className="px-4 py-8 md:px-8 md:py-12 max-w-2xl mx-auto"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <h1 className="font-[var(--font-serif)] text-3xl md:text-4xl font-bold text-slate-deep mb-2">
          Get Featured
        </h1>
        <p className="text-slate-deep/70 mb-8">
          Submit your business details. You can create a password on the next page to track your roadmap.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-4"
              >
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                    <Mail className="w-4 h-4" /> Email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    required
                    className={inputBase}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                    <Building2 className="w-4 h-4" /> Business Name
                  </span>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    required
                    className={inputBase}
                    placeholder="e.g. Sage & Stone Café"
                  />
                </label>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-4"
              >
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                    Business Type
                  </span>
                  <select
                    value={form.businessType}
                    onChange={(e) => update('businessType', e.target.value)}
                    required
                    className={`${inputBase} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%232D3748%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%272%27 d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-11`}
                  >
                    <option value="">Select business type...</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                    <FileText className="w-4 h-4" /> Business Description
                  </span>
                  <textarea
                    value={form.businessDescription}
                    onChange={(e) => update('businessDescription', e.target.value)}
                    rows={8}
                    className={`${inputBase} min-h-[180px] resize-y`}
                    placeholder="Describe your business, what you offer, and what makes it unique..."
                  />
                </label>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-4"
              >
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                    <Phone className="w-4 h-4" /> Contact
                  </span>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={(e) => update('contact', e.target.value)}
                    required
                    className={inputBase}
                    placeholder="Phone number or alternate contact"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-deep mb-1">
                    <FileCheck className="w-4 h-4" /> Upload City License (optional)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-slate-deep file:mr-3 file:py-2 file:px-4 file:rounded-[var(--radius-xl)] file:border-0 file:bg-sage/20 file:text-sage file:font-medium"
                  />
                  <p className="text-xs text-slate-deep/60 mt-1">PDF or image. You can also upload later from your dashboard.</p>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          {submitError && (
            <div role="alert" className="rounded-[var(--radius-xl)] bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
              {submitError}
            </div>
          )}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || submitting}
              className="px-4 py-2 rounded-[var(--radius-xl)] text-slate-deep hover:bg-white/60 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 rounded-[var(--radius-xl)] bg-sage text-white hover:bg-sage-light"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-[var(--radius-xl)] bg-sage text-white hover:bg-sage-light flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            )}
          </div>
        </form>

        <section className="mt-12 pt-8 border-t border-[var(--color-glass-border)]">
          <h2 className="font-[var(--font-serif)] font-bold text-xl text-slate-deep mb-4">
            Partner Status
          </h2>
          <p className="text-sm text-slate-deep/70 mb-4">
            After submitting, create your password on the success page to access your licensing roadmap.
          </p>
        </section>
      </motion.div>
    </Layout>
  )
}
