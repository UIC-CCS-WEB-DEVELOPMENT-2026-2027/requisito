import { Link } from 'react-router-dom'

// Props: none.
function NotFound() {
  return (
    <section className="page-content" aria-labelledby="not-found-title">
      <p className="eyebrow">Page not found</p>
      <h1 id="not-found-title">This page does not exist.</h1>
      <Link className="return-link" to="/">
        Return home
      </Link>
    </section>
  )
}

export default NotFound
