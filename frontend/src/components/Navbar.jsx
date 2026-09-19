import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandLogo from './BrandLogo'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200/90 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: CodeChef Logo & Navigation Links */}
        <div className="flex items-center gap-8">
          <BrandLogo />

          <nav className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-gray-700">
            <Link
              to="/courses"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <span>Courses</span>
              <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>

            <Link
              to="/problems"
              className="hover:text-blue-600 transition-colors"
            >
              Practice
            </Link>

            <Link
              to="/contests"
              className="hover:text-blue-600 transition-colors"
            >
              Compete
            </Link>

            <Link
              to="/assessments"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span>Assessments</span>
              {user?.collegeName && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="College Enrolled"></span>
              )}
            </Link>

            <Link
              to="/compiler"
              className="hover:text-blue-600 transition-colors"
            >
              Compiler
            </Link>

            <Link
              to="/for-colleges"
              className="hover:text-blue-600 transition-colors"
            >
              For Colleges
            </Link>
          </nav>
        </div>

        {/* Right: Auth Controls (Logged In vs Logged Out - Screenshot 1) */}
        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated ? (
            <>
              {/* Dark mode toggle icon (Screenshot 1) */}
              <button
                onClick={() => alert('Dark mode toggle')}
                className="text-gray-600 hover:text-gray-900 text-base p-1"
                title="Toggle theme"
              >
                🌙
              </button>

              {/* Upgrade to Pro button (Screenshot 1) */}
              <button
                onClick={() => alert('Upgrade to ByteForge Pro')}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#b45309] hover:text-[#92400e] bg-amber-50 border border-amber-300/80 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <span>⭐</span>
                <span>Upgrade To Pro</span>
              </button>

              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="bg-[#5b4638] hover:bg-[#4d3a2e] text-amber-300 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1 border border-amber-500/30"
                >
                  <span>👑</span>
                  <span>Super Admin</span>
                </Link>
              )}

              {user?.role === 'FACULTY_ADMIN' && (
                <Link
                  to="/university/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1"
                >
                  <span>🏛️</span>
                  <span>Faculty Portal</span>
                </Link>
              )}

              {/* User Avatar with Chef Hat (Screenshot 1) */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/profile/${user?.username}`}
                  className="flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 p-1 pl-2 pr-2.5 rounded-full transition-all bg-gray-50 text-xs font-bold text-gray-800"
                >
                  <span className="h-6 w-6 rounded-full bg-[#5b4638] text-white flex items-center justify-center text-xs">
                    👨‍🍳
                  </span>
                  <span>@{user?.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-600 text-xs font-semibold p-1"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-semibold text-[14px] transition-colors"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-[#2f66d4] hover:bg-[#2554b5] text-white font-bold text-[14px] px-5 py-2 rounded-lg transition-all shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
