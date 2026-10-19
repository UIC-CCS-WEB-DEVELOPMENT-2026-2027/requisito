import DocumentCard from '../components/DocumentCard.jsx'

// Placeholder documents until real document data exists.
const documents = [
  {
    id: 'valid-id',
    type: 'Valid ID',
    issueDate: '2026-02-12',
    status: 'Valid',
  },
  {
    id: 'birth-certificate',
    type: 'PSA birth certificate',
    issueDate: '2025-06-03',
    status: 'Expired',
  },
  {
    id: 'nbi-clearance',
    type: 'NBI clearance',
    issueDate: '2026-09-20',
    status: 'Expiring soon',
  },
]

function Documents() {
  return (
    <section className="page-content" aria-labelledby="documents-title">
      <p className="eyebrow">Documents</p>
      <h1 id="documents-title">Documents</h1>
      <p className="page-description">
        Documents you already hold, and when they expire.
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
