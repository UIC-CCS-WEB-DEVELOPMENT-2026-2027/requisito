import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { exportBarangaysCsv, filterAndSortBarangays } from '../data/barangayDirectory.js'
import { getBarangays, getDistricts } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Barangays() {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const adminDistrict = searchParams.get('admin') ?? ''
  const legislativeDistrict = searchParams.get('legislative') ?? ''
  const sortBy = searchParams.get('sort') ?? 'name'
  const direction = searchParams.get('direction') ?? 'asc'
  const districts = getDistricts()
  const records = getBarangays()
  const totalBarangays = records.filter((record) => !record.isSample).length
  const visible = filterAndSortBarangays(records, {
    query, adminDistrict, legislativeDistrict, sortBy, direction,
  })

  useEffect(() => {
    document.title = `${t('page.barangays')} | Requisito`
  }, [t])

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  function downloadCsv() {
    const file = new Blob([exportBarangaysCsv(visible)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = 'davao-barangays-filtered.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="page-content directory-page" aria-labelledby="barangays-title">
      <header className="page-heading">
        <p className="eyebrow">{t('barangays.eyebrow')}</p>
        <h1 id="barangays-title">{t('page.barangays')}</h1>
        <p className="page-description">{t('barangays.description')}</p>
      </header>
      <form className="portal-filters" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="barangay-search">{t('label.searchBarangays')}</label>
          <input id="barangay-search" type="search" value={query} onChange={(event) => updateFilter('q', event.target.value)} />
        </div>
        <div>
          <label htmlFor="admin-district">{t('barangays.adminDistrict')}</label>
          <select id="admin-district" value={adminDistrict} onChange={(event) => updateFilter('admin', event.target.value)}>
            <option value="">{t('barangays.allDistricts')}</option>
            {districts.map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="legislative-district">{t('barangays.legislativeDistrict')}</label>
          <select id="legislative-district" value={legislativeDistrict} onChange={(event) => updateFilter('legislative', event.target.value)}>
            <option value="">{t('barangays.allLegislativeDistricts')}</option>
            {['1st', '2nd', '3rd'].map((district) => <option key={district} value={district}>{district}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="barangay-sort">{t('barangays.sortBy')}</label>
          <select id="barangay-sort" value={sortBy} onChange={(event) => updateFilter('sort', event.target.value)}>
            <option value="name">{t('barangays.name')}</option>
            <option value="district">{t('barangays.adminDistrict')}</option>
            <option value="population">{t('barangays.population')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort-direction">{t('barangays.sortDirection')}</label>
          <select id="sort-direction" value={direction} onChange={(event) => updateFilter('direction', event.target.value)}>
            <option value="asc">{t('barangays.ascending')}</option>
            <option value="desc">{t('barangays.descending')}</option>
          </select>
        </div>
      </form>
      <div className="barangay-results-bar">
        <p aria-live="polite">{t('barangays.showing').replace('{shown}', visible.length).replace('{total}', totalBarangays)}</p>
        <button type="button" onClick={downloadCsv}>{t('barangays.exportCsv')}</button>
        <Link to="/districts">{t('nav.districts')}</Link>
      </div>
      {visible.length === 0 ? <EmptyState message={t('form.noRecords')} /> : districts.map((district) => {
        const districtRecords = visible.filter((record) => record.adminDistrict === district)
        if (!districtRecords.length) return null
        return (
          <section className="district-section" key={district} aria-labelledby={`district-${district}`}>
            <h2 id={`district-${district}`}><Link to={`/districts/${encodeURIComponent(district)}`}>{district}</Link></h2>
            <ul className="portal-grid">
              {districtRecords.map((record) => (
                <li className="portal-card" key={record.id}>
                  <h3><Link to={`/barangays/${record.slug}`}>{record.title}</Link></h3>
                  <p>{t('barangays.population')}: {record.population2020 == null ? t('barangays.populationNotImported') : record.population2020.toLocaleString()}</p>
                  <p className="status-badge verification-unverified">{t('status.unverified')}</p>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}

export default Barangays
