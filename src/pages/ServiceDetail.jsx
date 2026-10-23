import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getServiceBySlug } from '../data/helpers.js'

function phoneHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

function ServiceDetail() {
  const { slug } = useParams()
  const service = getServiceBySlug(slug)

  if (!service) {
    return (
      <section className="page-content" aria-labelledby="service-missing-title">
        <h1 id="service-missing-title">Service not found</h1>
        <EmptyState message="No service matches this address." />
        <Link className="return-link" to="/services">Browse services</Link>
      </section>
    )
  }

  return (
    <section className="page-content flow-content" aria-labelledby="service-title">
      <p className="eyebrow">{service.category}</p>
      <h1 id="service-title">{service.title}</h1>
      <p className="page-description">{service.description}</p>
      {service.timeSensitive && <p className="time-sensitive">Time-sensitive information. Confirm current details with the office.</p>}
      <dl className="portal-details">
        {service.contact.phone.length > 0 && (
          <div><dt>Phone</dt><dd>{service.contact.phone.map((phone) => <a key={phone} href={phoneHref(phone)}>{phone}</a>)}</dd></div>
        )}
        {service.contact.email && <div><dt>Email</dt><dd><a href={`mailto:${service.contact.email}`}>{service.contact.email}</a></dd></div>}
        {service.contact.address && <div><dt>Address or venue</dt><dd>{service.contact.address}</dd></div>}
        {service.contact.hours && <div><dt>Hours</dt><dd>{service.contact.hours}</dd></div>}
      </dl>
      {service.steps?.length > 0 && (
        <section aria-labelledby="service-steps-title">
          <h2 id="service-steps-title">Steps listed</h2>
          <ol>{service.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        </section>
      )}
      {service.notes && <p className="sample-notice">{service.notes}</p>}
      <RecordMeta record={service} />
      <Link className="return-link" to={`/contribute?record=${encodeURIComponent(service.slug)}`}>Report a correction</Link>
      {service.sourceUrl && <p><a href={service.sourceUrl} target="_blank" rel="noopener noreferrer">Open official page</a></p>}
    </section>
  )
}

export default ServiceDetail
