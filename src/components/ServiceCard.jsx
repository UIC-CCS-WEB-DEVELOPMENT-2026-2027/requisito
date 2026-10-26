import { Link } from 'react-router-dom'
import RecordMeta from './RecordMeta.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import ServiceMapActions from './ServiceMapActions.jsx'

// Props: service, one civic service record supplied by the parent page.
function ServiceCard({ service }) {
  const { t } = useLanguage()

  return (
    <li className="portal-card">
      <p className="eyebrow">{service.category}</p>
      <h2><Link to={href('serviceDetail', { slug: service.slug })}>{service.title}</Link></h2>
      <p>{service.description}</p>
      {service.timeSensitive && <p className="time-sensitive">{t('services.timeSensitive')}</p>}
      <ServiceMapActions service={service} />
      <RecordMeta record={service} />
    </li>
  )
}

export default ServiceCard
