import RecordMeta from './RecordMeta.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Props: guide, the verified service guide shown by the finder.
function GuideCard({ guide }) {
  const { t } = useLanguage()
  return (
    <li className="portal-card">
      <h2>{guide.title}</h2>
      <p>{guide.description}</p>
      <h3>{t('label.steps')}</h3>
      <ol>{guide.steps.map((step) => <li key={`${guide.id}-${step}`}>{step}</li>)}</ol>
      <RecordMeta record={guide} />
    </li>
  )
}

export default GuideCard
