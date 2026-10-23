import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getOfficials } from '../data/helpers.js'

function OfficialProfile() {
  const { slug } = useParams()
  const office = getOfficials().find((item) => item.slug === slug)
  if (!office) return <section className="page-content"><h1>Office not found</h1><EmptyState message="No matching office was found." /><Link to="/officials">All offices</Link></section>
  return (
    <section className="page-content flow-content" aria-labelledby="office-title">
      <p className="eyebrow">Office profile</p>
      <h1 id="office-title">{office.title}</h1>
      <p>{office.description}</p>
      {office.verification === 'verified' && office.holderName && <p>Office holder: {office.holderName}</p>}
      {office.verification !== 'verified' && <p>Not verified yet. Check the official city website.</p>}
      {office.verification === 'verified' && office.term && <p>Term: {office.term}</p>}
      <RecordMeta record={office} />
      <Link to="/officials">Back to offices</Link>
    </section>
  )
}

export default OfficialProfile
