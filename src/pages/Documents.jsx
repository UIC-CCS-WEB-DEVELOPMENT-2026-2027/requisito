import DocumentCard from '../components/DocumentCard.jsx'
import { getDocuments } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: none. The shared helper supplies fictional document examples.
function Documents() {
  const { t } = useLanguage()
  const documents = getDocuments()
  return (
    <section className="page-content" aria-labelledby="documents-title">
      <p className="eyebrow">{t('documents.eyebrow')}</p>
      <h1 id="documents-title">{t('page.documents')}</h1>
      <p className="page-description">
        {t('documents.description')}
      </p>
      <ul className="sprint-grid document-grid" aria-label={t('a11y.documents')}>
        {documents.map((document) => (
          <li key={document.id}>
            <DocumentCard
              type={document.type}
              issueDate={document.issueDate}
              status={document.status}
              record={document}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Documents
