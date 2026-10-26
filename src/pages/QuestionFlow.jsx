import { Navigate } from 'react-router-dom'
import { href } from '../routeManifest.js'

// Props: none. Preserve old links after switching to the Week 2 static sprint.
function QuestionFlow() {
  return <Navigate replace to={href('checklist')} />
}

export default QuestionFlow
