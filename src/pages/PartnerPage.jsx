import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Layout, { pageVariants, pageTransition } from '../components/Layout'
import { Check, Building2, User, Mail, FileText, Phone, Loader2 } from 'lucide-react'

const BUSINESS_TYPES = ['Cafe', 'Restaurant', 'Producer', 'Market', 'Other']

const inputBase =
  'w-full rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] bg-white/80 px-4 py-3 text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors'

export default function PartnerPage() {
  const [step, setStep] = useState(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    businessName: '',
    businessType: '',
    businessDescription: '',
    contact: '',
  })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowSuccessModal(true)
  }

  const handleCloseModal = () => {
    setShowSuccessModal(false)
    setStep(1)
    setForm({
      username: '',
      email: '',
      businessName: '',
      businessType: '',
      businessDescription: '',
      contact: '',
    })
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
          Partner Application
        </h1>
        <p className="text-slate-deep/70 mb-8">
          Get featured on KingstonAI. Apply for local business listing and permits.
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
                    <User className="w-4 h-4" /> Username
                  </span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => update('username', e.target.value)}
                    required
                    className={inputBase}
                    placeholder="Your display name"
                  />
                </label>
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
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
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
                className="px-5 py-2.5 rounded-[var(--radius-xl)] bg-sage text-white hover:bg-sage-light flex items-center gap-2"
              >
                Submit
              </button>
            )}
          </div>
        </form>

        <section className="mt-12 pt-8 border-t border-[var(--color-glass-border)]">
          <h2 className="font-[var(--font-serif)] font-bold text-xl text-slate-deep mb-4">
            Partner Status
          </h2>
          <p className="text-sm text-slate-deep/70 mb-4">
            Prototype: mock status table. HOOK_BACKEND_HERE for real permit portal.
          </p>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] overflow-hidden bg-white/60">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/80 text-left">
                  <th className="px-4 py-3 font-medium text-slate-deep">Business</th>
                  <th className="px-4 py-3 font-medium text-slate-deep">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--color-glass-border)]">
                  <td className="px-4 py-3 text-slate-deep">Demo Café</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                      Pending
                    </span>
                  </td>
                </tr>
                <tr className="border-t border-[var(--color-glass-border)]">
                  <td className="px-4 py-3 text-slate-deep">Local Farm Co.</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      Approved
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </motion.div>

      <AnimatePresence>
        {showSuccessModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-deep/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(400px,90vw)] rounded-[var(--radius-2xl)] bg-white shadow-xl border border-[var(--color-glass-border)] p-6 md:p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center">
                  <Check className="w-7 h-7 text-sage" />
                </div>
              </div>
              <h3 className="font-[var(--font-serif)] font-bold text-xl text-slate-deep text-center mb-2">
                Application received
              </h3>
              <p className="text-slate-deep/80 text-center text-sm mb-6">
                Redirecting to City of Kingston Permit Portal...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-sage animate-spin" />
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="mt-4 w-full py-2.5 rounded-[var(--radius-xl)] bg-slate-deep/10 text-slate-deep hover:bg-slate-deep/20 text-sm font-medium"
              >
                Close
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  )
}
