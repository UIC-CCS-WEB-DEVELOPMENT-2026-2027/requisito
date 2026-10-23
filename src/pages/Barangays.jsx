import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getBarangays, getDistricts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Barangays() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const barangays = getBarangays()
  const districts = getDistricts()
  const realBarangays = useMemo(() => barangays.filter((item) => !item.isSample), [barangays])
  const sampleBarangays = barangays.filter((item) => item.isSample)
  const visible = realBarangays.filter((item) =>
    `${item.title} ${item.adminDistrict}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <section className="page-content flow-content" aria-labelledby="barangays-title">
      <p className="eyebrow">Davao City directory</p>
      <h1 id="barangays-title">{t('page.barangays')}</h1>
      <p className="page-description">Official barangay data has not been imported yet. Sample entries below are fictional layout examples only.</p>
      <div className="portal-filters">
        <div>
          <label htmlFor="barangay-search">{t('label.searchBarangays')}</label>
          <input id="barangay-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </div>
      {realBarangays.length === 0 && <EmptyState message={query ? 'No records found' : 'Official barangay records have not been imported.'} />}
      {realBarangays.length === 0 && sampleBarangays.length > 0 && (
        <section className="sample-barangays" aria-labelledby="sample-barangays-title">
          <h2 id="sample-barangays-title">Sample data preview (not search results)</h2>
          <p>Place the official CSV at <code>data-source/davao-barangays.csv</code> and run the import script to replace these fictional fixtures.</p>
          {districts.map((district) => {
            const districtSamples = sampleBarangays.filter((item) => item.adminDistrict === district)
            return (
              <section className="district-section" key={district} aria-labelledby={`sample-district-${district}`}>
                <h3 id={`sample-district-${district}`}>{district}</h3>
                {districtSamples.length ? (
                  <ul className="portal-grid">
                    {districtSamples.map((item) => (
                      <li className="portal-card" key={item.id}>
                        <span className="status-badge">Sample data</span>
                        <h4><Link to={`/barangays/${item.slug}`}>{item.title}</Link></h4>
                        <RecordMeta record={item} />
                      </li>
                    ))}
                  </ul>
                ) : <EmptyState message="No sample fixture for this district." />}
              </section>
            )
          })}
        </section>
      )}
      {realBarangays.length > 0 && visible.length === 0 && <EmptyState message="No records found" />}
      {realBarangays.length > 0 && visible.length > 0 && districts.map((district) => {
        const districtRecords = visible.filter((item) => item.adminDistrict === district)
        return (
          <section className="district-section" key={district} aria-labelledby={`district-${district}`}>
            <h2 id={`district-${district}`}>{district}</h2>
            {districtRecords.length ? (
              <ul className="portal-grid">
                {districtRecords.map((item) => (
                  <li className="portal-card" key={item.id}>
                    <h3><Link to={`/barangays/${item.slug}`}>{item.title}</Link></h3>
                    <RecordMeta record={item} />
                  </li>
                ))}
              </ul>
            ) : <EmptyState message="No barangays listed for this district." />}
          </section>
        )
      })}
    </section>
  )
}

export default Barangays
