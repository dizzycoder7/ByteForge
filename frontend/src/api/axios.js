import axios from 'axios'

/**
 * Pre-configured Axios instance for all API calls.
 *
 * baseURL: '/api' — Vite's dev proxy forwards this to localhost:8080/api
 *   (configured in vite.config.js). In production, nginx would do the same.
 *   This means we never hardcode "localhost:8080" anywhere in the frontend.
 *
 * Two interceptors are attached:
 *
 * 1. REQUEST interceptor:
 *    Before every request leaves the browser, it checks localStorage for a JWT.
 *    If found, it attaches: Authorization: Bearer <token>
 *    This is the standard way to authenticate API calls with JWT.
 *
 * 2. RESPONSE interceptor:
 *    If any response comes back as 401 Unauthorized (token expired or invalid),
 *    it clears the stale token from localStorage and redirects to /login.
 *    Without this, the user would see confusing errors after token expiry.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const normalizedBaseUrl = rawBaseUrl.endsWith('/api') 
  ? rawBaseUrl 
  : (rawBaseUrl.endsWith('/') ? `${rawBaseUrl}api` : `${rawBaseUrl}/api`)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? normalizedBaseUrl : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT automatically ──────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle token expiry globally ────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stale session and force re-login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
