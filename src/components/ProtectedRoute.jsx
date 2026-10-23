import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Props: children. Client-only demo gate; no real authentication happens here.
function ProtectedRoute({ children }) {
  const { isSignedIn } = useAuth()
  const location = useLocation()
  return isSignedIn
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />
}

export default ProtectedRoute
