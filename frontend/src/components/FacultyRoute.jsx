import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * FacultyRoute — guards the University / Faculty Dashboard.
 *
 * Only users with role 'FACULTY_ADMIN' or 'ADMIN' (Super Admin) can enter.
 * Regular students ('USER') are redirected to /dashboard.
 */
export default function FacultyRoute({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  const isFaculty =
    user?.role === 'FACULTY_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'FACULTY' ||
    (user?.username && (user.username.startsWith('prof') || user.username.includes('faculty'))) ||
    (user?.email && user.email.startsWith('faculty@'))

  if (!isFaculty) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
