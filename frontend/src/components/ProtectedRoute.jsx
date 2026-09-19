import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps a route that requires authentication.
 * If the user is not logged in, redirects to /login.
 *
 * The `state={{ from: location }}` passes the current URL to the login page
 * so it can redirect back after a successful login (UX best practice).
 *
 * Usage in App.jsx:
 *   <Route path="/submissions/my" element={
 *     <ProtectedRoute><MySubmissionsPage /></ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
