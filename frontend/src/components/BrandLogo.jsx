import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ByteForge Logo in CodeChef signature style:
 * - Chef hat / Forge icon
 * - Warm chocolate-brown rounded banner with bold uppercase 'BYTEFORGE'
 * - Intelligently routes to /dashboard if logged in, or / (landing page) if logged out
 */
export default function BrandLogo({ size = 'md' }) {
  let isAuthenticated = false
  try {
    const auth = useAuth()
    isAuthenticated = auth?.isAuthenticated
  } catch {
    // Fallback if rendered outside AuthContext
    isAuthenticated = false
  }

  const destination = isAuthenticated ? '/dashboard' : '/'

  return (
    <Link to={destination} className="inline-flex items-center gap-1.5 group select-none">
      {/* Chef Hat with Forge spark */}
      <div className="flex flex-col items-center">
        <svg className="w-8 h-8 text-[#5b4638] -mb-1" viewBox="0 0 64 64" fill="currentColor">
          <path d="M32 10 C24 10 18 16 18 22 C14 23 10 27 10 32 C10 37 14 41 18 42 L46 42 C50 41 54 37 54 32 C54 27 50 23 46 22 C46 16 40 10 32 10 Z" fill="#d9c3b0" stroke="#5b4638" strokeWidth="2.5"/>
          <path d="M26 12 Q32 20 26 40 M38 12 Q32 20 38 40" stroke="#5b4638" strokeWidth="1.5" fill="none"/>
          <rect x="18" y="40" width="28" height="8" rx="2" fill="#5b4638"/>
          <text x="32" y="46" fill="#ffffff" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="monospace">&lt;..&gt;</text>
        </svg>
      </div>

      {/* Chocolate Brown Wordmark with ByteForge name */}
      <div className="bg-[#5b4638] text-white px-2.5 py-1 rounded-md font-black tracking-wider text-sm shadow-xs group-hover:bg-[#4d3a2e] transition-colors flex items-center">
        <span>BYTEFORGE</span>
      </div>
    </Link>
  )
}
