import { createContext, useContext, useReducer } from 'react'

/**
 * Global authentication state using React Context + useReducer.
 *
 * Why Context instead of prop-drilling?
 *   Auth state (who is logged in) is needed by many components: Navbar,
 *   ProtectedRoute, ProblemDetailPage (to enable submit button), etc.
 *   Passing it via props through every component tree level ("prop-drilling")
 *   is messy. Context puts the state in a global store any component can read.
 *
 * Why useReducer instead of useState?
 *   Auth state has multiple sub-fields (user, token, isAuthenticated) that
 *   change together. useReducer keeps all transitions in one predictable place.
 *   This is the same pattern Redux uses — an interviewer asking "how does Redux
 *   work?" can be answered by explaining this exact code.
 *
 * Why initialize from localStorage?
 *   If the user refreshes the page, React state resets — but localStorage
 *   persists. The initializer function (3rd arg to useReducer) reads from
 *   localStorage so the user stays logged in across refreshes.
 */

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Reducer ──────────────────────────────────────────────────────────────────
const initialState = {
  user: null,            // { username, email, role }
  token: null,
  isAuthenticated: false,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      }
    case 'LOGOUT':
      return { ...initialState }
    default:
      return state
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {

  // The 3rd argument to useReducer is a "lazy initializer" —
  // it runs ONCE on mount and reads the persisted session from localStorage.
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const token = localStorage.getItem('token')
      const user  = localStorage.getItem('user')
      if (token && user) {
        return { user: JSON.parse(user), token, isAuthenticated: true }
      }
    } catch {
      // Corrupted localStorage — start fresh
      localStorage.clear()
    }
    return initialState
  })

  /**
   * Called after a successful login/register API response.
   * Persists token + user to localStorage, then updates Context state.
   */
  const login = (authResponse) => {
    const user = {
      username:    authResponse.username,
      email:       authResponse.email,
      role:        authResponse.role,
      collegeName: authResponse.collegeName || null,
    }
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('user',  JSON.stringify(user))
    dispatch({ type: 'LOGIN', payload: { user, token: authResponse.token } })
  }

  /** Clears localStorage and resets state — used on logout. */
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom hook ───────────────────────────────────────────────────────────────
/**
 * useAuth() — consume auth context from any component.
 * Throws if used outside <AuthProvider> (catches setup mistakes early).
 *
 * Usage: const { isAuthenticated, user, login, logout } = useAuth()
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
