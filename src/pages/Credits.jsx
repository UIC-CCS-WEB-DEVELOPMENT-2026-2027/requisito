import EmptyState from '../components/EmptyState.jsx'

function Credits() {
  return (
    <section className="page-content" aria-labelledby="credits-title">
      <p className="eyebrow">Project acknowledgments</p>
      <h1 id="credits-title">Credits</h1>
      <p>This project studies civic-information patterns from BetterMakati and the Better Local Gov starter kit.</p>
      <p>Requisito is independently implemented in its existing React and plain CSS stack. No BetterMakati code, branding, imagery, or Makati-specific content was copied.</p>
      <p><a href="https://github.com/migi-macati/bettermakati" target="_blank" rel="noopener noreferrer">BetterMakati reference repository</a></p>
      <p><a href="https://github.com/migi-macati/bettermakati/blob/main/STARTER-KIT-README.md" target="_blank" rel="noopener noreferrer">Better Local Gov starter kit information</a></p>
      <EmptyState message="No files were copied from the reference repository." />
    </section>
  )
}

export default Credits
