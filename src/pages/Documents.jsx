import DocumentCard from '../components/DocumentCard.jsx'
import { getDocuments } from '../data/helpers.js'

// Props: none. The shared helper supplies fictional document examples.
function Documents() {
  const documents = getDocuments()
  return (
    <section className="page-content" aria-labelledby="documents-title">
      <p className="eyebrow">Documents</p>
      <h1 id="documents-title">Documents</h1>
      <p className="page-description">
        Fictional document tracker examples. Issue dates and statuses are sample values, not real personal records or calculated expiry dates.
      </p>
      <ul className="sprint-grid document-grid" aria-label="Your documents">
        {documents.map((document) => (
          <li key={document.id}>
            <DocumentCard
              type={document.type}
              issueDate={document.issueDate}
              status={document.status}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Documents
