import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'

// Props: none.
function NotFound() {
  return (
    <section className="page-content" aria-labelledby="not-found-title">
      <p className="eyebrow">Page not found</p>
      <h1 id="not-found-title">This page does not exist.</h1>
      <EmptyState message="No page matches this address." />
      <Link className="return-link" to="/">
        Return home
      </Link>
    </section>
  )
}

export default NotFound
