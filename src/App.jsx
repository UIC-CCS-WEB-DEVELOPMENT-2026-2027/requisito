import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useLanguage } from './i18n/LanguageContext.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Goals = lazy(() => import('./pages/Goals.jsx'))
const Checklist = lazy(() => import('./pages/Checklist.jsx'))
const Documents = lazy(() => import('./pages/Documents.jsx'))
const QuestionFlow = lazy(() => import('./pages/QuestionFlow.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Services = lazy(() => import('./pages/Services.jsx'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail.jsx'))
const Barangays = lazy(() => import('./pages/Barangays.jsx'))
const BarangayProfile = lazy(() => import('./pages/BarangayProfile.jsx'))
const AboutDavao = lazy(() => import('./pages/AboutDavao.jsx'))
const Updates = lazy(() => import('./pages/Updates.jsx'))
const Officials = lazy(() => import('./pages/Officials.jsx'))
const Search = lazy(() => import('./pages/Search.jsx'))
const Status = lazy(() => import('./pages/Status.jsx'))
const Contribute = lazy(() => import('./pages/Contribute.jsx'))
const Credits = lazy(() => import('./pages/Credits.jsx'))
const History = lazy(() => import('./pages/History.jsx'))
const Budget = lazy(() => import('./pages/Budget.jsx'))
const Procurement = lazy(() => import('./pages/Procurement.jsx'))
const Briefs = lazy(() => import('./pages/Briefs.jsx'))
const Monitor = lazy(() => import('./pages/Monitor.jsx'))
const OfficialProfile = lazy(() => import('./pages/OfficialProfile.jsx'))
const Elections = lazy(() => import('./pages/Elections.jsx'))
const Accountability = lazy(() => import('./pages/Accountability.jsx'))
const Participate = lazy(() => import('./pages/Participate.jsx'))
const Integrity = lazy(() => import('./pages/Integrity.jsx'))
const Districts = lazy(() => import('./pages/Districts.jsx'))
const DistrictProfile = lazy(() => import('./pages/DistrictProfile.jsx'))
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

function RouteLoading() {
  const { t } = useLanguage()
  return <p className="route-loading" role="status">{t('app.loading')}</p>
}

// Props: none.
function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
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
        <Route path="/districts" element={<Districts />} />
        <Route path="/districts/:name" element={<DistrictProfile />} />
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
    </Suspense>
  )
}

export default App
