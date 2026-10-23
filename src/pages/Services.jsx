import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getServices } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const categories = ['Emergency', 'Health', 'Business and Permits', 'Information']

function Services() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const services = getServices()
  const visibleServices = useMemo(() => services.filter((service) => {
    const matchesCategory = !category || service.category === category
    const matchesQuery = `${service.title} ${service.description} ${service.notes}`
      .toLowerCase().includes(query.trim().toLowerCase())
    return matchesCategory && matchesQuery
  }), [category, query, services])

  return (
    <section className="page-content flow-content" aria-labelledby="services-title">
      <p className="eyebrow">{t('services.eyebrow')}</p>
      <h1 id="services-title">{t('page.services')}</h1>
      <p className="page-description">{t('services.description')}</p>
      <div className="portal-filters">
        <div>
          <label htmlFor="services-search">{t('label.searchServices')}</label>
          <input id="services-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div>
          <label htmlFor="services-category">{t('label.category')}</label>
          <select id="services-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t('services.allCategories')}</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      {visibleServices.length ? (
        <ul className="portal-grid" aria-label={t('a11y.services')}>
          {visibleServices.map((service) => (
            <li className="portal-card" key={service.id}>
              <p className="eyebrow">{service.category}</p>
              <h2><Link to={`/services/${service.slug}`}>{service.title}</Link></h2>
              <p>{service.description}</p>
              {service.timeSensitive && <p className="time-sensitive">{t('services.timeSensitive')}</p>}
              <RecordMeta record={service} />
            </li>
          ))}
        </ul>
      ) : <EmptyState message={t('form.noRecords')} />}
    </section>
  )
}

export default Services
