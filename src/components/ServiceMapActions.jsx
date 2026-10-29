import { useLanguage } from '../i18n/LanguageContext.jsx'
import { getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from '../utils/maps.js'

function ServiceMapActions({ service }) {
  const { t } = useLanguage()
  const searchUrl = getGoogleMapsSearchUrl(service.title, service.contact.address)
  const directionsUrl = getGoogleMapsDirectionsUrl(service.title, service.contact.address)

  if (!searchUrl || !directionsUrl) {
    return <p className="service-map-unavailable" role="note">{t('service.mapUnavailable')}</p>
  }

  return (
    <div className="service-map-actions" role="group" aria-label={t('service.mapActions')}>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('service.mapView')} (${t('services.opensNewTab')})`}
      >
        {t('service.mapView')}
      </a>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('service.mapDirections')} (${t('services.opensNewTab')})`}
      >
        {t('service.mapDirections')}
      </a>
      {service.verification !== 'verified' && (
        <p className="service-map-note" role="note">{t('service.mapUnverified')}</p>
      )}
    </div>
  )
}

export default ServiceMapActions
