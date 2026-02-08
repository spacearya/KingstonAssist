// In dev, use same origin so Vite proxy forwards /api to backend (avoids CORS)
const API_BASE = import.meta.env.VITE_API_URL ?? ''

const STORAGE_KEY = 'kingston_user'

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw)
    return user && user.email ? user : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
}

/**
 * POST /api/signup - create account with email + password. Returns user object for auto-login.
 * Throws on 409 (email already registered).
 */
export async function signupApi(email, password) {
  const res = await fetch(`${API_BASE}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: (email || '').trim(), password: password || '' }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 409) throw new Error(data.detail ?? 'Email already registered')
  if (res.status === 400) throw new Error(data.detail ?? 'Invalid request')
  if (!res.ok) throw new Error(data.detail ?? 'Sign up failed')
  return data
}

/**
 * POST /api/login - returns user on 200, throws on 401
 */
export async function loginApi(email, password) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: (email || '').trim(), password: password || '' }),
    })
  } catch (e) {
    throw new Error(e.message === 'Failed to fetch' ? 'Cannot reach server. Is the API running?' : (e.message || 'Login failed'))
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401) throw new Error(data.detail ?? 'Invalid credentials')
  if (!res.ok) throw new Error(data.detail ?? data.message ?? 'Login failed')
  return data
}

/**
 * POST /api/submit-application - business details + optional license file. Saves to applications.txt only.
 * No password. Redirect to /success to finalize account.
 */
export async function submitApplication(data, licenseFile = null) {
  const form = new FormData()
  form.append('email', (data.email ?? '').trim())
  form.append('businessName', data.businessName ?? '')
  form.append('businessType', data.businessType ?? '')
  form.append('businessDescription', data.businessDescription ?? '')
  form.append('contact', data.contact ?? '')
  if (licenseFile) form.append('license_file', licenseFile)
  const res = await fetch(`${API_BASE}/api/submit-application`, {
    method: 'POST',
    body: form,
  })
  const body = await res.json().catch(() => ({}))
  if (res.status === 409) throw new Error(body.detail ?? 'Application already submitted for this email')
  if (res.status === 400) throw new Error(body.detail ?? 'Invalid request')
  if (!res.ok) throw new Error(body.detail ?? 'Submission failed')
  return body
}

/**
 * POST /api/finalize-account - create auth account. Email must exist in applications.txt.
 * Throws 400 "Please submit your business details first." if no application.
 */
export async function finalizeAccount(email, password) {
  const res = await fetch(`${API_BASE}/api/finalize-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: (email ?? '').trim(), password: password ?? '' }),
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 400) throw new Error(data.detail ?? 'Please submit your business details first.')
  if (res.status === 409) throw new Error(data.detail ?? 'Account already exists. Please log in.')
  if (!res.ok) throw new Error(data.detail ?? 'Failed to create account')
  return data
}

/**
 * GET /api/dashboard-data/{email} - JOIN auth + business. Returns { auth, business }.
 */
export async function getDashboardData(email) {
  const res = await fetch(`${API_BASE}/api/dashboard-data/${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error('Failed to load dashboard data')
  return res.json()
}

/** Legacy: POST /api/register (full form with password). Prefer submitApplication + finalizeAccount. */
export async function registerPartner(data, driversLicenseFile = null) {
  const form = new FormData()
  form.append('username', data.username ?? '')
  form.append('email', (data.email ?? '').trim())
  form.append('password', data.password ?? '')
  form.append('businessName', data.businessName ?? '')
  form.append('businessType', data.businessType ?? '')
  form.append('businessDescription', data.businessDescription ?? '')
  form.append('contact', data.contact ?? '')
  if (driversLicenseFile) form.append('drivers_license', driversLicenseFile)
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    body: form,
  })
  const body = await res.json().catch(() => ({}))
  if (res.status === 409) throw new Error(body.detail ?? 'Email already registered')
  if (res.status === 400) throw new Error(body.detail ?? 'Invalid request')
  if (!res.ok) throw new Error(body.detail ?? 'Registration failed')
  return body
}

export async function getUser(email) {
  const res = await fetch(`${API_BASE}/api/user?email=${encodeURIComponent(email)}`)
  if (!res.ok) throw new Error('Failed to load user')
  return res.json()
}


/**
 * Update progress. Pass step (1-6) to mark that step done (sets progress = max(current, step)).
 * Omit step to increment by 1.
 */
export async function updateProgress(email, step = null) {
  const res = await fetch(`${API_BASE}/api/user/progress?email=${encodeURIComponent(email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(step != null ? { step } : {}),
  })
  if (!res.ok) throw new Error('Failed to update progress')
  return res.json()
}

export async function uploadLicense(email, file) {
  const form = new FormData()
  form.append('email', email)
  form.append('file', file)
  const res = await fetch(`${API_BASE}/api/upload-license`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail ?? 'Upload failed')
  }
  return res.json()
}

/** Flatten static services.json into business list for fallback when API is down */
async function getStaticBusinesses() {
  try {
    const data = await import('../data/services.json')
    const list = []
    const mapCat = (cat) => ({ restaurants: 'Restaurant', places: 'Places', activities: 'Market', artifacts: 'Other' }[cat] || cat)
    for (const cat of data.categories || []) {
      const items = data[cat] || []
      for (const b of items) {
        list.push({
          id: b.id,
          name: b.name,
          description: b.description || '',
          category: mapCat(cat),
          address: b.address || '',
          sustainability: b.sustainability || '',
          live: b.live || false,
        })
      }
    }
    return { businesses: list }
  } catch {
    return { businesses: [] }
  }
}

export async function getVerifiedBusinesses(category = null) {
  const url = category
    ? `${API_BASE}/api/businesses?category=${encodeURIComponent(category)}`
    : `${API_BASE}/api/businesses`
  try {
    const res = await fetch(url)
    if (res.ok) return res.json()
  } catch (_) {
    /* network error, use fallback */
  }
  const fallback = await getStaticBusinesses()
  if (category) {
    fallback.businesses = fallback.businesses.filter(
      (b) => (b.category || '').toLowerCase() === category.toLowerCase()
    )
  }
  fallback.fromFallback = true
  return fallback
}

/** Admin: GET /api/admin/pending - users with status pending_review */
export async function getPendingUsers() {
  const res = await fetch(`${API_BASE}/api/admin/pending`)
  if (!res.ok) throw new Error('Failed to load pending users')
  return res.json()
}

/** Admin: POST /api/admin/approve - set user status=approved, is_verified=true */
export async function adminApprove(email) {
  const res = await fetch(`${API_BASE}/api/admin/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b.detail ?? 'Approve failed')
  }
  return res.json()
}

/** Admin: POST /api/admin/reject - mark user as rejected */
export async function adminReject(email) {
  const res = await fetch(`${API_BASE}/api/admin/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    throw new Error(b.detail ?? 'Reject failed')
  }
  return res.json()
}

/**
 * GET /api/discovery/categories - Get all available data file categories
 */
export async function getDiscoveryCategories() {
  const res = await fetch(`${API_BASE}/api/discovery/categories`)
  if (!res.ok) throw new Error('Failed to load categories')
  return res.json()
}

/**
 * GET /api/discovery/data?category_id=... - Get entries from a specific category
 */
export async function getDiscoveryData(categoryId) {
  const res = await fetch(`${API_BASE}/api/discovery/data?category_id=${encodeURIComponent(categoryId)}`)
  if (!res.ok) throw new Error('Failed to load data')
  return res.json()
}