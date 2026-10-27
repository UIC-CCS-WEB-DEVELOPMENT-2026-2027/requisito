import { Link } from 'react-router-dom'
import RecordMeta from './RecordMeta.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import ServiceMapActions from './ServiceMapActions.jsx'
import { SERVICE_CATEGORY_TRANSLATION_KEYS } from '../utils/serviceFilters.js'

// Props: service, one civic service record supplied by the parent page.
function ServiceCard({ service }) {
  const { t } = useLanguage()

  return (
    <li className="portal-card">
      <p className="eyebrow">{t(SERVICE_CATEGORY_TRANSLATION_KEYS[service.category] ?? service.category)}</p>
      <h2><Link to={href('serviceDetail', { slug: service.slug })}>{service.title}</Link></h2>
      <p>{service.description}</p>
      {service.timeSensitive && <p className="time-sensitive">{t('services.timeSensitive')}</p>}
      {service.onlineUrl && (
        <>
          <a
            className="service-online-link"
            href={service.onlineUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('services.openOnlineService')}
          </a>
          {service.onlineServiceNote && <p className="service-availability-note" role="note">{service.onlineServiceNote}</p>}
          {!service.onlineServiceNote && service.sourceUrl === 'https://davaocity.gov.ph/more-services/' && (
            <p className="service-availability-note" role="note">{t('services.onlineServiceCaveat')}</p>
          )}
        </>
      )}
      {service.availabilityNote && (
        <p className="service-availability-note" role="note">{service.availabilityNote}</p>
      )}
      {!service.onlineUrl && <ServiceMapActions service={service} />}
      <RecordMeta record={service} />
    </li>
  )
}

export default ServiceCard
