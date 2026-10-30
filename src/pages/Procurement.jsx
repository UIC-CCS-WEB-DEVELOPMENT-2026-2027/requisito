import { useMemo, useState } from 'react'
import CatalogEmptyState from '../components/CatalogEmptyState.jsx'
import OfficialSourceDirectory from '../components/OfficialSourceDirectory.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getProcurement } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Procurement() {
  const { t } = useLanguage()
  const rows = getProcurement().filter((row) => !row.isSample)
  const statuses = useMemo(() => [...new Set(rows.map((row) => row.status))].sort(), [rows])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const visible = rows.filter((row) => (!status || row.status === status) &&
    `${row.referenceNo} ${row.title} ${row.agency} ${row.status}`.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <section className="page-content directory-page" aria-labelledby="procurement-title">
      <header className="page-heading">
        <p className="eyebrow">{t('budget.eyebrow')}</p>
        <h1 id="procurement-title">{t('page.procurement')}</h1>
        <p className="page-description">{t('procurement.description')}</p>
      </header>
      <div className="portal-search-form">
        <label htmlFor="procurement-query">{t('label.procurementSearch')}</label>
        <input id="procurement-query" value={query} onChange={(event) => setQuery(event.target.value)} />
        <label htmlFor="procurement-status">{t('label.procurementStatus')}</label>
        <select id="procurement-status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">{t('procurement.allStatuses')}</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
      <p aria-live="polite">{visible.length} {t('label.recordCount')}</p>
      {visible.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <caption>{t('label.procurementCaption')}</caption>
            <thead><tr><th scope="col">{t('label.reference')}</th><th scope="col">{t('label.title')}</th><th scope="col">{t('label.agency')}</th><th scope="col">{t('label.amount')}</th><th scope="col">{t('label.awardDate')}</th><th scope="col">{t('label.status')}</th><th scope="col">{t('label.source')}</th></tr></thead>
            <tbody>{visible.map((row) => <tr key={row.id}>
              <th scope="row">{row.referenceNo}</th><td>{row.title}</td><td>{row.agency}</td>
              <td>{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(row.amountPHP)}</td>
              <td>{row.awardDate ?? 'Not provided'}</td><td>{row.status}</td>
              <td><RecordMeta record={row} /></td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <CatalogEmptyState
        what={t('emptyState.procurementWhat')}
        how={t('emptyState.dataHow')}
        action={t('emptyState.procurementAction')}
      />}
      <OfficialSourceDirectory feature="procurement" />
    </section>
  )
}

export default Procurement
