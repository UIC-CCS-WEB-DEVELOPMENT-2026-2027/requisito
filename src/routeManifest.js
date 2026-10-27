export const routeManifest = [
  { id: 'home', path: '/', component: 'Home', access: 'public', nav: 'header', labelKey: 'nav.home', smokePath: '/' },
  { id: 'login', path: '/login', component: 'Login', access: 'public', labelKey: 'layout.signIn', smokePath: '/login' },
  { id: 'goals', path: '/goals', component: 'Goals', access: 'public', nav: 'header', labelKey: 'nav.goals', smokePath: '/goals' },
  { id: 'goalDetail', path: '/goals/:slug', component: 'GoalDetail', access: 'public', smokePath: '/goals/first-job' },
  { id: 'checklist', path: '/checklist', component: 'Checklist', access: 'public', nav: 'header', labelKey: 'nav.checklist', smokePath: '/checklist?goal=1' },
  { id: 'documents', path: '/documents', component: 'Documents', access: 'public', nav: 'header', labelKey: 'nav.documents', smokePath: '/documents' },
  { id: 'documentGuide', path: '/documents/:slug', component: 'DocumentGuide', access: 'public', smokePath: '/documents/first-job-sss-number' },
  { id: 'questions', path: '/questions', component: 'QuestionFlow', access: 'public', labelKey: 'nav.checklist', smokePath: '/questions' },
  { id: 'services', path: '/services', component: 'Services', access: 'public', nav: 'header', labelKey: 'nav.services', footer: 'explore', smokePath: '/services' },
  { id: 'serviceDetail', path: '/services/:slug', component: 'ServiceDetail', access: 'public', smokePath: '/services/central-911' },
  { id: 'serviceGuides', path: '/service-guides', component: 'ServiceGuides', access: 'public', labelKey: 'feature.serviceGuides.title', footer: 'explore', smokePath: '/service-guides' },
  { id: 'whereToGo', path: '/where-to-go', component: 'WhereToGo', access: 'public', labelKey: 'feature.whereToGo.title', smokePath: '/where-to-go' },
  { id: 'barangays', path: '/barangays', component: 'Barangays', access: 'public', nav: 'header', labelKey: 'nav.barangays', footer: 'explore', smokePath: '/barangays' },
  { id: 'barangayProfile', path: '/barangays/:slug', component: 'BarangayProfile', access: 'public', smokePath: '/barangays/barangay-1-a' },
  { id: 'districts', path: '/districts', component: 'Districts', access: 'public', nav: 'header', labelKey: 'nav.districts', smokePath: '/districts' },
  { id: 'districtProfile', path: '/districts/:name', component: 'DistrictProfile', access: 'public', smokePath: '/districts/Poblacion' },
  { id: 'about', path: '/about-davao', component: 'AboutDavao', access: 'public', labelKey: 'nav.about', footer: 'explore', smokePath: '/about-davao' },
  { id: 'updates', path: '/updates', component: 'Updates', access: 'public', labelKey: 'nav.updates', footer: 'explore', smokePath: '/updates' },
  { id: 'officials', path: '/officials', component: 'Officials', access: 'public', labelKey: 'nav.officials', footer: 'civic', smokePath: '/officials' },
  { id: 'officialProfile', path: '/officials/:slug', component: 'OfficialProfile', access: 'public', smokePath: '/officials/mayor' },
  { id: 'search', path: '/search', component: 'Search', access: 'public', nav: 'header', labelKey: 'nav.search', smokePath: '/search' },
  { id: 'status', path: '/status', component: 'Status', access: 'public', labelKey: 'nav.sources', footer: 'data', smokePath: '/status' },
  { id: 'contribute', path: '/contribute', component: 'Contribute', access: 'public', labelKey: 'nav.contribute', footer: 'about', smokePath: '/contribute' },
  { id: 'credits', path: '/credits', component: 'Credits', access: 'public', labelKey: 'nav.credits', footer: 'about', smokePath: '/credits' },
  { id: 'history', path: '/history', component: 'History', access: 'public', labelKey: 'nav.history', footer: 'explore', smokePath: '/history' },
  { id: 'budget', path: '/budget', component: 'Budget', access: 'public', labelKey: 'nav.budget', footer: 'data', smokePath: '/budget' },
  { id: 'procurement', path: '/procurement', component: 'Procurement', access: 'public', labelKey: 'nav.procurement', footer: 'data', smokePath: '/procurement' },
  { id: 'briefs', path: '/briefs', component: 'Briefs', access: 'public', labelKey: 'nav.briefs', footer: 'explore', smokePath: '/briefs' },
  { id: 'monitor', path: '/monitor', component: 'Monitor', access: 'public', labelKey: 'nav.monitor', footer: 'data', smokePath: '/monitor' },
  { id: 'elections', path: '/elections', component: 'Elections', access: 'public', labelKey: 'nav.elections', footer: 'civic', smokePath: '/elections' },
  { id: 'accountability', path: '/accountability', component: 'Accountability', access: 'public', labelKey: 'nav.accountability', footer: 'civic', smokePath: '/accountability' },
  { id: 'participate', path: '/participate', component: 'Participate', access: 'public', labelKey: 'nav.participate', footer: 'civic', smokePath: '/participate' },
  { id: 'integrity', path: '/integrity', component: 'Integrity', access: 'public', labelKey: 'nav.integrity', footer: 'about', smokePath: '/integrity' },
  { id: 'map', path: '/map', component: 'GovernmentLocations', access: 'public', feature: 'map', smokePath: '/map' },
  { id: 'reports', path: '/reports', component: 'FeaturePage', access: 'public', feature: 'reports', smokePath: '/reports' },
  { id: 'reportDetail', path: '/reports/:slug', component: 'FeaturePage', access: 'public', feature: 'reportDetail', smokePath: '/reports/not-published' },
  { id: 'publicRecords', path: '/public-records', component: 'FeaturePage', access: 'public', feature: 'publicRecords', smokePath: '/public-records' },
  { id: 'publicRecordDetail', path: '/public-records/:slug', component: 'FeaturePage', access: 'public', feature: 'publicRecordDetail', smokePath: '/public-records/not-published' },
  { id: 'legislation', path: '/legislation', component: 'FeaturePage', access: 'public', feature: 'legislation', smokePath: '/legislation' },
  { id: 'civicAudit', path: '/civic-audit', component: 'FeaturePage', access: 'public', feature: 'civicAudit', smokePath: '/civic-audit' },
  { id: 'civicAuditResults', path: '/civic-audit/results', component: 'FeaturePage', access: 'public', feature: 'civicAuditResults', smokePath: '/civic-audit/results' },
  { id: 'civicReports', path: '/civic-reports', component: 'FeaturePage', access: 'public', feature: 'civicReports', smokePath: '/civic-reports' },
  { id: 'nearbyReports', path: '/nearby-reports', component: 'FeaturePage', access: 'public', feature: 'nearbyReports', smokePath: '/nearby-reports' },
  { id: 'assets', path: '/assets', component: 'FeaturePage', access: 'public', feature: 'assets', smokePath: '/assets' },
  { id: 'calendar', path: '/calendar', component: 'FeaturePage', access: 'public', feature: 'calendar', smokePath: '/calendar' },
  { id: 'communityTools', path: '/community-tools', component: 'FeaturePage', access: 'public', feature: 'communityTools', smokePath: '/community-tools' },
  { id: 'concernFinder', path: '/concern-finder', component: 'FeaturePage', access: 'public', feature: 'concernFinder', smokePath: '/concern-finder' },
  { id: 'contact', path: '/contact', component: 'FeaturePage', access: 'public', feature: 'contact', labelKey: 'feature.contact.title', footer: 'about', smokePath: '/contact' },
  { id: 'documentLookup', path: '/document-lookup', component: 'FeaturePage', access: 'public', feature: 'documentLookup', smokePath: '/document-lookup' },
  { id: 'government', path: '/government', component: 'FeaturePage', access: 'public', feature: 'government', smokePath: '/government' },
  { id: 'heritage', path: '/heritage', component: 'FeaturePage', access: 'public', feature: 'heritage', smokePath: '/heritage' },
  { id: 'mobility', path: '/mobility', component: 'FeaturePage', access: 'public', feature: 'mobility', smokePath: '/mobility' },
  { id: 'tourism', path: '/tourism', component: 'FeaturePage', access: 'public', feature: 'tourism', smokePath: '/tourism' },
  { id: 'cinemas', path: '/cinemas', component: 'FeaturePage', access: 'public', feature: 'cinemas', smokePath: '/cinemas' },
  { id: 'estates', path: '/estates', component: 'FeaturePage', access: 'public', feature: 'estates', smokePath: '/estates' },
  { id: 'live', path: '/live', component: 'FeaturePage', access: 'public', feature: 'live', smokePath: '/live' },
  { id: 'statistics', path: '/statistics', component: 'FeaturePage', access: 'public', feature: 'statistics', smokePath: '/statistics' },
  { id: 'help', path: '/help', component: 'Help', access: 'public', labelKey: 'feature.help.title', footer: 'about', smokePath: '/help' },
  { id: 'quiz', path: '/quiz', component: 'Quiz', access: 'public', labelKey: 'quiz.title', footer: 'explore', smokePath: '/quiz' },
  { id: 'accessibility', path: '/accessibility', component: 'AccessibilityPage', access: 'public', labelKey: 'accessibility.title', footer: 'about', smokePath: '/accessibility' },
  { id: 'sitemap', path: '/sitemap', component: 'Sitemap', access: 'public', labelKey: 'sitemap.title', footer: 'about', smokePath: '/sitemap' },
  { id: 'privacy', path: '/privacy', component: 'FeaturePage', access: 'public', feature: 'privacy', labelKey: 'feature.privacy.title', footer: 'about', smokePath: '/privacy' },
  { id: 'terms', path: '/terms', component: 'FeaturePage', access: 'public', feature: 'terms', labelKey: 'feature.terms.title', footer: 'about', smokePath: '/terms' },
  { id: 'notFound', path: '*', component: 'NotFound', access: 'public', smokePath: '/not-found-example' },
]

export const adminRoutes = [
  '/admin/login', '/admin', '/admin/records', '/admin/records/:type/:id',
  '/admin/review', '/admin/users', '/admin/audit',
]

const routesById = new Map(routeManifest.map((route) => [route.id, route]))

export function href(routeId, params = {}, query = {}) {
  const route = routesById.get(routeId)
  if (!route || route.path === '*') throw new Error(`Unknown route id: ${routeId}`)
  const path = route.path.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_, name) => {
    const value = params[name]
    if (value === undefined || value === null || String(value) === '') {
      throw new Error(`Missing "${name}" for route "${routeId}".`)
    }
    return encodeURIComponent(String(value))
  })
  const search = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined && value !== null))
  return `${path}${search.size ? `?${search}` : ''}`
}

export function routeMatches(pathname) {
  return routeManifest.find((route) => route.path !== '*' &&
    new RegExp(`^${route.path.replace(/:[^/]+/g, '[^/]+').replaceAll('/', '\\/')}/?$`).test(pathname)) ?? null
}
