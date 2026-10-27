import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import { getServices } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { filterServices, SERVICE_CATEGORY_TRANSLATION_KEYS, sortServices } from '../utils/serviceFilters.js'
import { href } from '../routeManifest.js'
import { Link } from 'react-router-dom'

const services = getServices()
const categories = [...new Set(services.map((service) => service.category))]
  .sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base' }))
function Services() {
  const { t } = useLanguage()
  // Stores the controlled search text so typing immediately updates the visible list.
  const [query, setQuery] = useState('')
  // Stores the selected category; an empty value means every category.
  const [category, setCategory] = useState('')
  // Stores the selected ordering without changing the imported service records.
  const [sortMode, setSortMode] = useState('status')
  const visibleServices = sortServices(
    filterServices(services, { query, category }),
    sortMode,
  )
  const resultCount = t('services.showingCount')
    .replace('{shown}', String(visibleServices.length))
    .replace('{total}', String(services.length))
  const categoryCounts = categories.map((item) => ({
    name: item,
    count: services.filter((service) => service.category === item).length,
  }))

  function categoryLabel(name) {
    const key = SERVICE_CATEGORY_TRANSLATION_KEYS[name]
    return key ? t(key) : name
  }

  function clearFilters() {
    setQuery('')
    setCategory('')
    setSortMode('status')
  }

  return (
    <section className="page-content flow-content" aria-labelledby="services-title">
      <p className="eyebrow">{t('services.eyebrow')}</p>
      <h1 id="services-title">{t('page.services')}</h1>
      <p className="page-description">{t('services.description')}</p>
      <p>
        <Link to={href('serviceGuides')}>{t('feature.serviceGuides.title')}</Link>
        {' · '}
        <Link to={href('whereToGo')}>{t('feature.whereToGo.title')}</Link>
      </p>
      <p className="official-service-directory">
        <a
          href="https://davaocity.gov.ph/more-services/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('services.officialDirectory')}
        </a>
        <span>{t('services.officialDirectoryNote')}</span>
      </p>
      <section className="service-category-section" aria-labelledby="service-categories-title">
        <h2 id="service-categories-title">{t('services.browseCategories')}</h2>
        <nav className="service-category-grid" aria-label={t('services.categoryNavigation')}>
          <button
            className={`service-category-card${category === '' ? ' is-selected' : ''}`}
            type="button"
            aria-label={t('services.allCategories')}
            aria-pressed={category === ''}
            onClick={() => setCategory('')}
          >
            <span>{t('services.allCategories')}</span>
            <span className="service-category-count">
              {services.length} {t('services.serviceCountLabel')}
            </span>
          </button>
          {categoryCounts.map(({ name, count }) => (
            <button
              className={`service-category-card${category === name ? ' is-selected' : ''}`}
              key={name}
              type="button"
              aria-label={categoryLabel(name)}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              <span>{categoryLabel(name)}</span>
              <span className="service-category-count">
                {count} {t('services.serviceCountLabel')}
              </span>
            </button>
          ))}
        </nav>
      </section>
      <div className="portal-filters">
        <div>
          <label htmlFor="services-search">{t('label.searchServices')}</label>
          <input id="services-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div>
          <label htmlFor="services-category">{t('label.category')}</label>
          <select id="services-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t('services.allCategories')}</option>
            {/* Category names are unique values derived from the local service catalog. */}
            {categories.map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="services-sort">{t('services.sortLabel')}</label>
          <select id="services-sort" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="status">{t('services.sortStatus')}</option>
            <option value="time-sensitive">{t('services.sortTimeSensitive')}</option>
            <option value="title">{t('services.sortAlphabetical')}</option>
          </select>
        </div>
      </div>
      <p aria-live="polite">{resultCount}</p>
      {visibleServices.length ? (
        <ul className="portal-grid" aria-label={t('a11y.services')}>
          {/* The stable service id keeps each card associated with the same record as filters change. */}
          {visibleServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ul>
      ) : (
        <>
          <EmptyState message={t('form.noRecords')} />
          <p>{t('services.emptyHint')}</p>
          <button className="secondary-button" type="button" onClick={clearFilters}>
            {t('services.clearFilters')}
          </button>
        </>
      )}
    </section>
  )
}

export default Services
