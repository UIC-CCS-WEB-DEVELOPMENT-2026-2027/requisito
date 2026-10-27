import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import ServiceMapActions from '../components/ServiceMapActions.jsx'
import { getServiceBySlug } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import { SERVICE_CATEGORY_TRANSLATION_KEYS } from '../utils/serviceFilters.js'

function phoneHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function ServiceDetail() {
  const { t } = useLanguage()
  const { slug } = useParams()
  const service = getServiceBySlug(slug)

  if (!service) {
    return (
      <section className="page-content" aria-labelledby="service-missing-title">
        <h1 id="service-missing-title">{t('service.notFound')}</h1>
        <EmptyState message={t('service.noMatch')} />
        <Link className="return-link" to={href('services')}>{t('service.browse')}</Link>
      </section>
    )
  }

  return (
    <section className="page-content flow-content" aria-labelledby="service-title">
      <p className="eyebrow">{t(SERVICE_CATEGORY_TRANSLATION_KEYS[service.category] ?? service.category)}</p>
      <h1 id="service-title">{service.title}</h1>
      <p className="page-description">{service.description}</p>
      {service.timeSensitive && <p className="time-sensitive">{t('service.confirmDetails')}</p>}
      {service.onlineUrl && (
        <p className="service-online-action">
          <a
            className="service-online-link"
            href={service.onlineUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('services.openOnlineService')}
          </a>
          {service.onlineServiceNote
            ? <span>{service.onlineServiceNote}</span>
            : service.sourceUrl === 'https://davaocity.gov.ph/more-services/' &&
              <span>{t('services.onlineServiceCaveat')}</span>}
        </p>
      )}
      {service.availabilityNote && (
        <p className="service-availability-note" role="note">{service.availabilityNote}</p>
      )}
      {service.feeDetails && (
        <section aria-labelledby="service-fees-title">
          <h2 id="service-fees-title">{t('service.fees')}</h2>
          {service.feeDetails.length > 0 ? (
            <ul>
              {service.feeDetails.map((fee) => (
                <li key={`${fee.amount}-${fee.sourceUrl}`}>
                  <strong>{fee.amount}</strong> — {fee.description}{' '}
                  <a href={fee.sourceUrl} target="_blank" rel="noopener noreferrer">{t('service.feeSource')}</a>
                  {fee.sourceDate && <span> ({t('service.sourceDate')}: <time dateTime={fee.sourceDate}>{fee.sourceDate}</time>)</span>}
                  {fee.observedOn && <span> ({t('service.checkedOn')}: <time dateTime={fee.observedOn}>{fee.observedOn}</time>)</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('service.noFeeAmount')}</p>
          )}
          {service.feesNote && <p className="sample-notice">{service.feesNote}</p>}
        </section>
      )}
      {service.requirements?.length > 0 && (
        <section aria-labelledby="service-requirements-title">
          <h2 id="service-requirements-title">{t('service.requirements')}</h2>
          <ul>{service.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
        </section>
      )}
      {service.processingInfo && (
        <section aria-labelledby="service-processing-title">
          <h2 id="service-processing-title">{t('service.processing')}</h2>
          <p>{service.processingInfo}</p>
        </section>
      )}
      <dl className="portal-details">
        {service.contact.phone.length > 0 && (
          <div><dt>{t('service.phone')}</dt><dd>{service.contact.phone.map((phone) => <a key={phone} href={phoneHref(phone)}>{phone}</a>)}</dd></div>
        )}
        {service.contact.email && <div><dt>{t('service.email')}</dt><dd><a href={`mailto:${service.contact.email}`}>{service.contact.email}</a></dd></div>}
        {service.contact.address && <div><dt>{t('service.address')}</dt><dd>{service.contact.address}</dd></div>}
        {service.contact.hours && <div><dt>{t('service.hours')}</dt><dd>{service.contact.hours}</dd></div>}
      </dl>
      {service.steps?.length > 0 && (
        <section aria-labelledby="service-steps-title">
          <h2 id="service-steps-title">{t('service.steps')}</h2>
          <ol>{service.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
      )}
      {!service.onlineUrl && <ServiceMapActions service={service} />}
      {service.notes && <p className="sample-notice">{service.notes}</p>}
      <RecordMeta record={service} />
      <Link className="return-link" to={href('contribute', {}, { record: service.slug })}>{t('common.reportCorrection')}</Link>
      {service.sourceUrl && <p><a href={service.sourceUrl} target="_blank" rel="noopener noreferrer">{t('service.openOfficial')}</a></p>}
    </section>
  )
}

export default ServiceDetail
