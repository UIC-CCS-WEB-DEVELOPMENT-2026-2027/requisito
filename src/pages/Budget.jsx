import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getBudget } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

function Budget() {
  const { t } = useLanguage()
  const rows = getBudget().filter((row) => !row.isSample)
  const years = [...new Set(rows.map((row) => row.fiscalYear))].sort((a, b) => b - a)
  const [year, setYear] = useState('')
  const visible = rows.filter((row) => String(row.fiscalYear) === year)
  const total = visible.reduce((sum, row) => sum + row.amountPHP, 0)
  return (
    <section className="page-content flow-content" aria-labelledby="budget-title">
      <p className="eyebrow">Public data dashboard</p>
      <h1 id="budget-title">{t('page.budget')}</h1>
      <p className="page-description">Budget figures appear only when supplied from an official source CSV. Amounts are not estimates.</p>
      <label htmlFor="budget-year">{t('label.fiscalYear')}</label>
      <select id="budget-year" value={year} onChange={(event) => setYear(event.target.value)}>
        <option value="">{t('label.chooseFiscalYear')}</option>
        {years.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      {visible.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <caption>{t('label.budgetCaption').replace('{year}', year)}</caption>
            <thead><tr><th scope="col">{t('label.sector')}</th><th scope="col">{t('label.amount')}</th><th scope="col">{t('label.shareOfTotal')}</th><th scope="col">{t('label.source')}</th></tr></thead>
            <tbody>{visible.map((row) => {
              const share = total > 0 ? row.amountPHP / total * 100 : 0
              return <tr key={row.id}>
                <th scope="row">{row.sector}</th>
                <td>{peso.format(row.amountPHP)}</td>
                <td><div className="data-bar" role="img" aria-label={`${share.toFixed(1)} percent of selected total`}><span style={{ width: `${share}%` }} /></div>{share.toFixed(1)}%</td>
                <td><RecordMeta record={row} /></td>
              </tr>
            })}</tbody>
          </table>
        </div>
      ) : <EmptyState message={t('status.noBudget')} />}
    </section>
  )
}

export default Budget
