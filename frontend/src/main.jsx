import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * React 18 uses createRoot (not the old ReactDOM.render).
 * StrictMode renders components twice in development to surface
 * side-effect bugs — it has zero impact on production builds.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
