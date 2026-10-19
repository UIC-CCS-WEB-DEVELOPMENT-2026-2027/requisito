import { Navigate } from 'react-router-dom'

// Props: none. Preserve old links after switching to the Week 2 static sprint.
function QuestionFlow() {
  return <Navigate replace to="/checklist" />
}

export default QuestionFlow
