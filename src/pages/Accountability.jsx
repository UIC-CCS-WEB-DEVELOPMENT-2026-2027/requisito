import { useState } from 'react'
import CatalogEmptyState from '../components/CatalogEmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getAccountability } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Accountability() {
  const { t } = useLanguage()
  const records = getAccountability().filter((item) => !item.isSample)
  const [query, setQuery] = useState('')
  const visible = records.filter((item) => `${item.kind} ${item.title} ${item.referenceNo ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <section className="page-content flow-content" aria-labelledby="accountability-title">
      <p className="eyebrow">{t('accountability.eyebrow')}</p>
      <h1 id="accountability-title">{t('page.accountability')}</h1>
      <p className="page-description">{t('accountability.description')}</p>
      <label htmlFor="ledger-search">{t('label.accountabilitySearch')}</label>
      <input id="ledger-search" value={query} onChange={(event) => setQuery(event.target.value)} />
      <p aria-live="polite">{visible.length} {t('label.recordCount')}</p>
      {visible.length ? <ul className="portal-grid">{visible.map((record) =>
        <li className="portal-card" key={record.id}>
          <p className="eyebrow">{record.kind}</p><h2>{record.title}</h2><p>{record.description}</p>
          <p>{t('accountability.officialBody')} {record.officialBody}</p>
          {record.referenceNo && <p>{t('accountability.reference')} {record.referenceNo}</p>}
          {record.date && <p>{t('accountability.date')} {record.date}</p>}
          <RecordMeta record={record} />
        </li>)}</ul> : <CatalogEmptyState
        what={t('emptyState.accountabilityWhat')}
        how={t('emptyState.dataHow')}
        action={t('emptyState.accountabilityAction')}
      />}
    </section>
  )
}

export default Accountability
