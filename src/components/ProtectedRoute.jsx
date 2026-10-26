import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { href } from '../routeManifest.js'

// Props: children. Client-only demo gate; no real authentication happens here.
function ProtectedRoute({ children }) {
  const { isSignedIn } = useAuth()
  const location = useLocation()
  return isSignedIn
    ? children
    : <Navigate to={href('login')} state={{ from: location }} replace />
}

export default ProtectedRoute
