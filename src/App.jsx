import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Goals from './pages/Goals.jsx'
import Checklist from './pages/Checklist.jsx'
import Documents from './pages/Documents.jsx'
import QuestionFlow from './pages/QuestionFlow.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Services from './pages/Services.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Barangays from './pages/Barangays.jsx'
import BarangayProfile from './pages/BarangayProfile.jsx'
import AboutDavao from './pages/AboutDavao.jsx'
import Updates from './pages/Updates.jsx'
import Officials from './pages/Officials.jsx'
import Search from './pages/Search.jsx'
import Status from './pages/Status.jsx'
import Contribute from './pages/Contribute.jsx'
import Credits from './pages/Credits.jsx'
import History from './pages/History.jsx'
import Budget from './pages/Budget.jsx'
import Procurement from './pages/Procurement.jsx'
import Briefs from './pages/Briefs.jsx'
import Monitor from './pages/Monitor.jsx'
import OfficialProfile from './pages/OfficialProfile.jsx'
import Elections from './pages/Elections.jsx'
import Accountability from './pages/Accountability.jsx'
import Participate from './pages/Participate.jsx'
import Integrity from './pages/Integrity.jsx'

// Props: none.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/checklist" element={<ProtectedRoute><Checklist /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/questions" element={<QuestionFlow />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/barangays" element={<Barangays />} />
        <Route path="/barangays/:slug" element={<BarangayProfile />} />
        <Route path="/about-davao" element={<AboutDavao />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/officials" element={<Officials />} />
        <Route path="/officials/:slug" element={<OfficialProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/status" element={<Status />} />
        <Route path="/contribute" element={<Contribute />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/history" element={<History />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/procurement" element={<Procurement />} />
        <Route path="/briefs" element={<Briefs />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/elections" element={<Elections />} />
        <Route path="/accountability" element={<Accountability />} />
        <Route path="/participate" element={<Participate />} />
        <Route path="/integrity" element={<Integrity />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
