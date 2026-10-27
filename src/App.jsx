import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useLanguage } from './i18n/LanguageContext.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Goals = lazy(() => import('./pages/Goals.jsx'))
const GoalDetail = lazy(() => import('./pages/GoalDetail.jsx'))
const Checklist = lazy(() => import('./pages/Checklist.jsx'))
const Documents = lazy(() => import('./pages/Documents.jsx'))
const DocumentGuide = lazy(() => import('./pages/DocumentGuide.jsx'))
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
const ServiceGuides = lazy(() => import('./pages/ServiceGuides.jsx'))
const WhereToGo = lazy(() => import('./pages/WhereToGo.jsx'))
const Help = lazy(() => import('./pages/Help.jsx'))
const Quiz = lazy(() => import('./pages/Quiz.jsx'))
const AccessibilityPage = lazy(() => import('./pages/AccessibilityPage.jsx'))
const Sitemap = lazy(() => import('./pages/Sitemap.jsx'))
const GovernmentLocations = lazy(() => import('./components/GovernmentLocations.jsx'))
const FeaturePage = lazy(() => import('./pages/FeaturePage.jsx'))
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
import { routeManifest } from './routeManifest.js'

const pages = {
  Home, Goals, GoalDetail, Checklist, Documents, DocumentGuide, QuestionFlow, NotFound, Login, Services, ServiceDetail,
  Barangays, BarangayProfile, AboutDavao, Updates, Officials, Search, Status, Contribute, Credits,
  History, Budget, Procurement, Briefs, Monitor, OfficialProfile, Elections, Accountability,
  Participate, Integrity, Districts, DistrictProfile, ServiceGuides, WhereToGo,
  Help, Quiz, AccessibilityPage, Sitemap, FeaturePage,
  GovernmentLocations,
}

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
          {routeManifest.map((route) => {
            const Page = pages[route.component]
            const page = <Page {...(route.feature ? { feature: route.feature } : {})} />
            return (
              <Route
                key={route.id}
                path={route.path}
                element={route.access === 'protected' ? <ProtectedRoute>{page}</ProtectedRoute> : page}
              />
            )
          })}
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
