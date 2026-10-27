import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import LiveCityInfo from '../components/LiveCityInfo.jsx'
import OfficialSourceLeads from '../components/OfficialSourceLeads.jsx'
import OfficialSourceDirectory from '../components/OfficialSourceDirectory.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getFeatureRecords, getServices } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href, routeManifest } from '../routeManifest.js'

const features = {
  map: { title: 'feature.map.title', description: 'feature.map.description', empty: 'feature.map.empty', catalog: 'mapLocations', alternatives: ['services', 'barangays'], sourceSlugs: ['city-information-office'] },
  reports: { title: 'feature.reports.title', description: 'feature.reports.description', empty: 'feature.reports.empty', catalog: 'reports', alternatives: ['services', 'updates'], sourceSlugs: ['city-information-office', 'davao-city-contact-center'] },
  reportDetail: { title: 'feature.reportDetail.title', description: 'feature.reportDetail.description', empty: 'feature.reportDetail.empty', catalog: 'reports', alternatives: ['reports'], sourceSlugs: ['city-information-office'] },
  publicRecords: { title: 'feature.publicRecords.title', description: 'feature.publicRecords.description', empty: 'feature.publicRecords.empty', catalog: 'publicRecords', alternatives: ['accountability'], sourceSlugs: ['city-information-office'] },
  publicRecordDetail: { title: 'feature.publicRecordDetail.title', description: 'feature.publicRecordDetail.description', empty: 'feature.publicRecordDetail.empty', catalog: 'publicRecords', alternatives: ['publicRecords'], sourceSlugs: ['city-information-office'] },
  legislation: { title: 'feature.legislation.title', description: 'feature.legislation.description', empty: 'feature.legislation.empty', catalog: 'publicRecords', alternatives: ['accountability', 'officials'], sourceSlugs: ['city-information-office'] },
  civicAudit: { title: 'feature.civicAudit.title', description: 'feature.civicAudit.description', empty: 'feature.civicAudit.empty', catalog: 'civicAuditEntries', alternatives: ['status'] },
  civicAuditResults: { title: 'feature.civicAuditResults.title', description: 'feature.civicAuditResults.description', empty: 'feature.civicAuditResults.empty', catalog: 'civicAuditEntries', alternatives: ['status'] },
  civicReports: { title: 'feature.civicReports.title', description: 'feature.civicReports.description', empty: 'feature.civicReports.empty', catalog: 'reports', alternatives: ['contribute'], sourceSlugs: ['davao-city-contact-center'] },
  nearbyReports: { title: 'feature.nearbyReports.title', description: 'feature.nearbyReports.description', empty: 'feature.nearbyReports.empty', catalog: 'reports', alternatives: ['services'], sourceSlugs: ['central-911'] },
  assets: { title: 'feature.assets.title', description: 'feature.assets.description', empty: 'feature.assets.empty', catalog: 'assets', alternatives: ['services'], sourceSlugs: ['city-information-office'] },
  calendar: { title: 'feature.calendar.title', description: 'feature.calendar.description', empty: 'feature.calendar.empty', catalog: 'events', alternatives: ['updates'], sourceSlugs: ['city-information-office'] },
  communityTools: { title: 'feature.communityTools.title', description: 'feature.communityTools.description', empty: 'feature.communityTools.empty', catalog: 'communityTools', alternatives: ['services'], sourceSlugs: ['city-information-office'] },
  concernFinder: { title: 'feature.concernFinder.title', description: 'feature.concernFinder.description', empty: 'feature.concernFinder.empty', catalog: 'communityTools', alternatives: ['search'], sourceSlugs: ['davao-city-contact-center'] },
  contact: { title: 'feature.contact.title', description: 'feature.contact.description', empty: 'feature.contact.empty', catalog: 'services', alternatives: ['services'], contact: true },
  documentLookup: { title: 'feature.documentLookup.title', description: 'feature.documentLookup.description', empty: 'feature.documentLookup.empty', catalog: 'publicRecords', alternatives: ['services'], sourceSlugs: ['city-information-office', 'city-treasurers-office'] },
  government: { title: 'feature.government.title', description: 'feature.government.description', empty: 'feature.government.empty', catalog: 'publicRecords', alternatives: ['officials', 'services'], sourceSlugs: ['city-information-office'] },
  heritage: { title: 'feature.heritage.title', description: 'feature.heritage.description', empty: 'feature.heritage.empty', catalog: 'heritageSites', alternatives: ['about'], sourceSlugs: ['city-information-office'] },
  mobility: { title: 'feature.mobility.title', description: 'feature.mobility.description', empty: 'feature.mobility.empty', catalog: 'transitRoutes', alternatives: ['services'], sourceSlugs: ['city-information-office'] },
  tourism: { title: 'feature.tourism.title', description: 'feature.tourism.description', empty: 'feature.tourism.empty', catalog: 'tourismPlaces', alternatives: ['about'], sourceSlugs: ['city-information-office'] },
  cinemas: { title: 'feature.cinemas.title', description: 'feature.cinemas.description', empty: 'feature.cinemas.empty', catalog: 'cinemas', alternatives: ['services'] },
  estates: { title: 'feature.estates.title', description: 'feature.estates.description', empty: 'feature.estates.empty', catalog: 'estateListings', alternatives: ['services'] },
  live: { title: 'feature.live.title', description: 'feature.live.description', empty: 'feature.live.empty', catalog: 'events', alternatives: ['updates'], sourceSlugs: ['city-information-office'] },
  statistics: { title: 'feature.statistics.title', description: 'feature.statistics.description', empty: 'feature.statistics.empty', catalog: 'reports', alternatives: ['status', 'monitor'] },
  help: { title: 'feature.help.title', description: 'feature.help.description', empty: 'feature.help.empty', catalog: null, alternatives: ['serviceGuides', 'services', 'search'], sourceSlugs: ['city-information-office'] },
  privacy: { title: 'feature.privacy.title', description: 'feature.privacy.description', empty: 'feature.privacy.empty', catalog: null, alternatives: ['integrity'] },
  terms: { title: 'feature.terms.title', description: 'feature.terms.description', empty: 'feature.terms.empty', catalog: null, alternatives: ['integrity'] },
}

function FeaturePage({ feature }) {
  const { t } = useLanguage()
  const { slug } = useParams()
  const details = features[feature]
  const items = details.catalog === 'services'
    ? getServices()
    : details.catalog ? getFeatureRecords(details.catalog) : []
  const record = slug ? items.find((item) => item.slug === slug) : null
  const serviceSources = details.contact
    ? []
    : getServices().filter((service) => details.sourceSlugs?.includes(service.slug))

  return (
    <section className="page-content flow-content" aria-labelledby={`${feature}-title`}>
      <p className="eyebrow">{t('feature.eyebrow')}</p>
      <h1 id={`${feature}-title`}>{t(details.title)}</h1>
      <p className="page-description">{t(details.description)}</p>
      {details.contact ? null : feature === 'live' ? <LiveCityInfo /> : record ? (
        <>
          <h2>{record.title}</h2>
          {record.description && <p>{record.description}</p>}
          {record.sourceUrl && <RecordMeta record={record} />}
        </>
      ) : (
        <EmptyState message={t(details.empty)} />
      )}
      {details.contact && (
        <div className="feature-contact-placeholder" role="note">
          <p>{t('feature.contact.destination')}</p>
          <a href="https://davaocity.gov.ph/contact-us/" target="_blank" rel="noopener noreferrer">
            {t('feature.contact.action')}
          </a>
          <p>{t('feature.contact.externalNotice')}</p>
        </div>
      )}
      <OfficialSourceDirectory feature={feature} />
      <OfficialSourceLeads sources={serviceSources} />
      <nav aria-label={t('feature.alternatives')}>
        <h2>{t('feature.alternatives')}</h2>
        <ul>
          {details.alternatives.map((routeId) => {
            const labelKey = features[routeId]?.title ??
              routeManifest.find((route) => route.id === routeId)?.labelKey ??
              `nav.${routeId}`
            return <li key={routeId}><Link to={href(routeId)}>{t(labelKey)}</Link></li>
          })}
        </ul>
      </nav>
    </section>
  )
}

export default FeaturePage
