import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Checklist from './pages/Checklist.jsx'
import Goals from './pages/Goals.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
