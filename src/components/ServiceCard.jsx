import { Link } from 'react-router-dom'
import RecordMeta from './RecordMeta.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: service, one civic service record supplied by the parent page.
function ServiceCard({ service }) {
  const { t } = useLanguage()

  return (
    <li className="portal-card">
      <p className="eyebrow">{service.category}</p>
      <h2><Link to={`/services/${service.slug}`}>{service.title}</Link></h2>
      <p>{service.description}</p>
      {service.timeSensitive && <p className="time-sensitive">{t('services.timeSensitive')}</p>}
      <RecordMeta record={service} />
    </li>
  )
}

export default ServiceCard
