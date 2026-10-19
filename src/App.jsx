import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Goals from './pages/Goals.jsx'
import Checklist from './pages/Checklist.jsx'
import Documents from './pages/Documents.jsx'
import QuestionFlow from './pages/QuestionFlow.jsx'
import NotFound from './pages/NotFound.jsx'

// Props: none.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/questions" element={<QuestionFlow />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
