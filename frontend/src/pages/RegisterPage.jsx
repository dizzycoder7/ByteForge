import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import CodeChefFooter from '../components/CodeChefFooter'
import api from '../api/axios'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [fullName, setFullName] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Password requirement checks for visual color highlights
  const pass = form.password || ''
  const has8Chars = pass.length >= 8
  const hasUpper = /[A-Z]/.test(pass)
  const hasLower = /[a-z]/.test(pass)
  const hasNumber = /[0-9]/.test(pass)
  const hasSpecial = /[^A-Za-z0-9]/.test(pass)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreeTerms) {
      setErrors({ general: 'Please agree to ByteForge Terms and Privacy Policy.' })
      return
    }

    setErrors({})
    setLoading(true)

    try {
      const { data } = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      })
      login(data)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data)
      } else {
        setErrors({
          general:
            err.response?.data?.error ||
            'Registration failed. Please try again.',
        })
      }
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
            <span className="px-5 py-1.5 rounded-full bg-[#3169d2] text-white shadow-xs">
              Sign up
            </span>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-gray-600 hover:text-gray-900 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. CENTERED SIGN UP CARD                                           */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] space-y-5 text-center">
          
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            Join ByteForge to start coding
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
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-2.5 rounded-lg text-left">
              {errors.general}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Username / Handle"
                className={`w-full px-3.5 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 ${
                  errors.username
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.username}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email Address"
                className={`w-full px-3.5 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 ${
                  errors.email
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Password"
                  className={`w-full px-3.5 py-2.5 pr-10 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 ${
                    errors.password
                      ? 'border-red-400'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-700 select-none text-xs"
                >
                  👁️
                </button>
              </div>

              {/* Password Requirement Colors */}
              <p className="text-[10.5px] leading-relaxed text-gray-500 mt-2">
                Use <span className={has8Chars ? 'text-green-600 font-bold' : 'text-amber-700 font-medium'}>8 characters</span> with a mix of{' '}
                <span className={hasUpper ? 'text-green-600 font-bold' : 'text-gray-700'}>uppercase</span>,{' '}
                <span className={hasLower ? 'text-green-600 font-bold' : 'text-gray-700'}>lowercase</span>,{' '}
                <span className={hasNumber ? 'text-green-600 font-bold' : 'text-gray-700'}>numbers</span>, and{' '}
                <span className={hasSpecial ? 'text-green-600 font-bold' : 'text-red-500 font-medium'}>special characters (e.g.!@#$%&amp;)</span>
              </p>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2 text-[11px] text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-3.5 w-3.5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to <span className="text-[#2f66d4] underline">ByteForge Terms</span> and{' '}
                  <span className="text-[#2f66d4] underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#6ea8fe] hover:bg-[#4d8bf8] text-white font-bold rounded-lg shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs tracking-wider uppercase"
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </form>

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
