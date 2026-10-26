import { Link } from 'react-router-dom'
import { getBarangayBySlug, getOfficials, getServiceBySlug } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest, routeMatches } from '../routeManifest.js'

function decoded(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return ''
  }
}

// Props: pathname, the current router path used to show a localized page trail.
function Breadcrumbs({ pathname }) {
  const { t } = useLanguage()
  if (pathname === '/') return null
  const route = routeMatches(pathname) ?? routeManifest.find((item) => item.id === 'notFound')
  const segments = pathname.split('/').filter(Boolean)
  const slug = decoded(segments.at(-1) ?? '')
  let currentLabel

  if (route.id === 'serviceDetail') currentLabel = getServiceBySlug(slug)?.title
  else if (route.id === 'barangayProfile') currentLabel = getBarangayBySlug(slug)?.title
  else if (route.id === 'officialProfile') currentLabel = getOfficials().find((office) => office.slug === slug)?.title
  else if (route.id === 'districtProfile') currentLabel = slug
  else if (route.feature) currentLabel = t(`feature.${route.feature}.title`)
  else if (route.labelKey) currentLabel = t(route.labelKey)
  else currentLabel = t(route.id === 'notFound' ? 'notFound.title' : 'page.home')

  return (
    <nav className="breadcrumbs" aria-label={t('a11y.breadcrumbs')}>
      <ol>
        <li><Link to={href('home')}>{t('nav.home')}</Link></li>
        <li aria-current="page">{currentLabel}</li>
      </ol>
    </nav>
  )
}

export default Breadcrumbs
