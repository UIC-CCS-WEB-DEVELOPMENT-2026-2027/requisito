import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from './EmptyState.jsx'
import GuideCard from './GuideCard.jsx'
import { getBriefs, getVerifiedGuides } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

const guideCategories = [...new Set(getBriefs().map((guide) => guide.category))]
  .sort((left, right) => left.localeCompare(right, 'en', { sensitivity: 'base' }))

// Props: titleKey and descriptionKey choose the purpose-specific text for this shared finder.
function ServiceGuideFinder({ titleKey, descriptionKey }) {
  const { t } = useLanguage()
  // The selected category controls the visible verified guide records.
  const [category, setCategory] = useState('')
  const visibleGuides = getVerifiedGuides(category)

  return (
    <section className="page-content flow-content" aria-labelledby="guide-finder-title">
      <p className="eyebrow">{t('guides.eyebrow')}</p>
      <h1 id="guide-finder-title">{t(titleKey)}</h1>
      <p className="page-description">{t(descriptionKey)}</p>
      <p>
        <Link to={titleKey === 'feature.serviceGuides.title' ? href('whereToGo') : href('serviceGuides')}>
          {t('guides.switchView')}
        </Link>
      </p>
      <label htmlFor="guide-category">{t('guides.categoryLabel')}</label>
      <select id="guide-category" value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="">{t('guides.allCategories')}</option>
        {guideCategories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <p aria-live="polite">
        {t('guides.resultCount').replace('{shown}', String(visibleGuides.length))}
      </p>
      {visibleGuides.length ? (
        <ul className="portal-grid" aria-label={t('guides.results')}>
          {visibleGuides.map((guide) => <GuideCard key={guide.id} guide={guide} />)}
        </ul>
      ) : (
        <>
          <EmptyState message={t('guides.noVerifiedGuides')} />
          <p>{t('guides.sourceAlternative')}</p>
          <Link className="return-link" to={href('services')}>{t('nav.services')}</Link>
        </>
      )}
    </section>
  )
}

export default ServiceGuideFinder
