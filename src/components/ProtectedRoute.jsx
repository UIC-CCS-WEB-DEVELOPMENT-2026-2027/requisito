import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Props: children. Client-only demo gate; no real authentication happens here.
function ProtectedRoute({ children }) {
  const { isSignedIn } = useAuth()
  return isSignedIn ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
