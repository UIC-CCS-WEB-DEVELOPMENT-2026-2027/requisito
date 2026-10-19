import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="page-content" aria-labelledby="home-title">
      <p className="eyebrow">Welcome to Requisito</p>
      <h1 id="home-title">Make room for what matters.</h1>
      <p className="page-description">
        Choose a goal, answer a few quick questions, and turn your intention
        into a clear next-step checklist.
      </p>
      <Link className="return-link" to="/goals">
        Choose a goal <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}

export default Home
