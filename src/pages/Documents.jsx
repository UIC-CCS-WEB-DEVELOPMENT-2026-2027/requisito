import DocumentCard from '../components/DocumentCard.jsx'
import { getDocuments } from '../data/helpers.js'

// Props: none. Document examples come from helpers.js.
function Documents() {
  const documents = getDocuments()
  return (
    <section className="page-content" aria-labelledby="documents-title">
      <p className="eyebrow">Sample tracker</p>
      <h1 id="documents-title">Your documents</h1>
      <p className="sample-notice">Fictional document examples only. Issue dates and valid/expiring statuses are sample values, not real records or calculated expiry dates.</p>
      <div className="sprint-grid">
        {documents.map((document) => (
          <DocumentCard key={document.id} type={document.type} issueDate={document.issueDate} status={document.status} />
        ))}
      </div>
    </section>
  )
}

export default Documents
