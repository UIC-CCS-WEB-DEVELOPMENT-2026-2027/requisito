import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getBarangayBySlug } from '../data/helpers.js'

function BarangayProfile() {
  const { slug } = useParams()
  const barangay = getBarangayBySlug(slug)

  if (!barangay) {
    return (
      <section className="page-content" aria-labelledby="barangay-missing-title">
        <h1 id="barangay-missing-title">Barangay not found</h1>
        <EmptyState message="No barangay matches this address." />
        <Link className="return-link" to="/barangays">Browse barangays</Link>
      </section>
    )
  }

  return (
    <section className="page-content flow-content" aria-labelledby="barangay-title">
      <p className="eyebrow">{barangay.isSample ? 'Sample data' : 'Barangay profile'}</p>
      <h1 id="barangay-title">{barangay.title}</h1>
      <p className="page-description">{barangay.description}</p>
      <dl className="portal-details">
        <div><dt>Administrative district</dt><dd>{barangay.adminDistrict}</dd></div>
        {barangay.legislativeDistrict != null && <div><dt>Legislative district</dt><dd>{barangay.legislativeDistrict}</dd></div>}
        {barangay.population2020 != null && <div><dt>2020 population</dt><dd>{barangay.population2020.toLocaleString()}</dd></div>}
      </dl>
      <RecordMeta record={barangay} />
      <Link className="return-link" to={`/contribute?record=${encodeURIComponent(barangay.slug)}`}>Report a correction</Link>
    </section>
  )
}

export default BarangayProfile
