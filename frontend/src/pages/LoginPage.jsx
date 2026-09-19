import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', form)
      login(data)
      navigate(from, { replace: true })
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Invalid email or password. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      
      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. SINGLE AUTH HEADER WITH LOGO & [Sign up] [Login] PILL TOGGLE    */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-200/90 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <BrandLogo />

          {/* ByteForge Auth Pill Toggle */}
          <div className="flex items-center bg-[#f1f5f9] p-1 rounded-full border border-gray-200 text-xs font-bold">
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-full text-gray-600 hover:text-gray-900 transition-all"
            >
              Sign up
            </Link>
            <span className="px-5 py-1.5 rounded-full bg-[#3169d2] text-white shadow-xs">
              Login
            </span>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. CENTERED LOGIN CARD                                             */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] space-y-6 text-center">
          
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Log in to your existing profile
          </h1>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={() => alert('Google Sign-In integration.')}
            className="w-full flex items-center justify-center gap-2.5 bg-[#edf2fe] hover:bg-[#e2ecfe] text-[#2f66d4] font-semibold py-2.5 px-4 rounded-lg border border-blue-200/60 transition-colors text-xs shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* OR Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider font-mono">
                OR
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg text-left">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus
                placeholder="Username or Email"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                className="w-full px-3.5 py-2.5 pr-10 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-700 select-none text-xs"
              >
                👁️
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#4d8bf8] hover:bg-[#3b79e6] active:bg-[#2f66d4] text-white font-bold rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs tracking-wider uppercase"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          {/* Forgot Password */}
          <div>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault()
                alert('Password reset link will be sent to your registered email.')
              }}
              className="text-[#2f66d4] hover:underline font-semibold text-xs inline-block"
            >
              Forgot Password?
            </a>
          </div>

          <p className="text-[11px] text-gray-400 pt-2">
            If something is not right, email us at{' '}
            <a href="mailto:help@byteforge.tech" className="text-[#2f66d4] underline">
              help@byteforge.tech
            </a>
          </p>

        </div>
      </main>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. FOOTER                                                          */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <CodeChefFooter />

    </div>
  )
}
