import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import RecordMeta from './RecordMeta.jsx'
import ServiceMapActions from './ServiceMapActions.jsx'
import { getServices } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'
import { getGoogleMapsSearchUrl } from '../utils/maps.js'

const locations = getServices().filter((service) =>
  getGoogleMapsSearchUrl(service.title, service.contact.address),
)
const categories = [...new Set(locations.map(({ category }) => category))]
  .sort((left, right) => left.localeCompare(right))

function GovernmentLocations() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const visibleLocations = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    return locations.filter((service) =>
      (!category || service.category === category) &&
      (!search || `${service.title} ${service.description} ${service.category} ${service.contact.address}`
        .toLocaleLowerCase().includes(search)),
    )
  }, [category, query])

  return (
    <section className="page-content flow-content" aria-labelledby="map-title">
      <p className="eyebrow">{t('feature.eyebrow')}</p>
      <h1 id="map-title">{t('feature.map.title')}</h1>
      <p className="page-description">{t('map.description')}</p>
      <p className="sample-notice">{t('map.unverifiedNotice')}</p>
      <div className="portal-filters">
        <div>
          <label htmlFor="map-search">{t('map.search')}</label>
          <input id="map-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div>
          <label htmlFor="map-category">{t('label.category')}</label>
          <select id="map-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t('services.allCategories')}</option>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <p aria-live="polite">{t('map.resultCount').replace('{count}', String(visibleLocations.length))}</p>
      {visibleLocations.length ? (
        <ul className="portal-grid">
          {visibleLocations.map((service) => (
            <li className="portal-card" key={service.id}>
              <p className="eyebrow">{service.category}</p>
              <h2><Link to={href('serviceDetail', { slug: service.slug })}>{service.title}</Link></h2>
              <p>{service.description}</p>
              <p>{service.contact.address}</p>
              <ServiceMapActions service={service} />
              <RecordMeta record={service} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state" role="status">{t('map.noResults')}</p>
      )}
    </section>
  )
}

export default GovernmentLocations
