const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

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
 * POST /api/login - returns user on 200, throws on 401
 */
export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: (email || '').trim(), password: password || '' }),
  })
  if (res.status === 401) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? 'Invalid credentials')
  }
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

/**
 * POST /api/register - save partner application to backend (database.txt).
 * Throws on 409 (email already registered) or other error.
 */
export async function registerPartner(data) {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: data.username ?? '',
      email: (data.email ?? '').trim(),
      password: data.password ?? '',
      businessName: data.businessName ?? '',
      businessType: data.businessType ?? '',
      businessDescription: data.businessDescription ?? '',
      contact: data.contact ?? '',
    }),
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

export async function updateProgress(email) {
  const res = await fetch(`${API_BASE}/api/user/progress?email=${encodeURIComponent(email)}`, {
    method: 'PATCH',
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

export async function getVerifiedBusinesses(category = null) {
  const url = category
    ? `${API_BASE}/api/businesses?category=${encodeURIComponent(category)}`
    : `${API_BASE}/api/businesses`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load businesses')
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