import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * AdminRoute — like ProtectedRoute, but also checks for ADMIN role.
 *
 * Two-layer check:
 *   1. isAuthenticated → if not, redirect to /login
 *   2. user.role === 'ADMIN' → if not, redirect to /problems (not a 403 page,
 *      just silently redirect — we don't want to hint that the route exists)
 *
 * Usage:
 *   <Route path="/admin/problems/new" element={
 *     <AdminRoute><CreateProblemPage /></AdminRoute>
 *   } />
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/problems" replace />

  return children
}
