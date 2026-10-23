import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getBriefs } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function Briefs() {
  const { t } = useLanguage()
  const briefs = getBriefs()
  return (
    <section className="page-content flow-content" aria-labelledby="briefs-title">
      <p className="eyebrow">Plain-language guides</p>
      <h1 id="briefs-title">{t('page.briefs')}</h1>
      <p className="page-description">These outlines summarize catalog records. Confirm current instructions with the issuing office.</p>
      {briefs.length ? (
        <div className="portal-grid">
          {briefs.map((brief) => (
            <article className="portal-card" key={brief.id}>
              <h2>{brief.title}</h2>
              <p>{brief.description}</p>
              {brief.timeSensitive && <p className="time-sensitive">Details may change. Confirm current instructions before acting.</p>}
              <h3>{t('label.steps')}</h3>
              <ol>{brief.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              {brief.whatYouNeed.length > 0 && <>
                <h3>{t('label.whatYouNeed')}</h3>
                <ul>{brief.whatYouNeed.map((item) => <li key={item}>{item}</li>)}</ul>
              </>}
              <RecordMeta record={brief} />
              <p><Link to={`/contribute?record=${encodeURIComponent(brief.slug)}`}>Report a correction</Link></p>
            </article>
          ))}
        </div>
      ) : <EmptyState message="No civic briefs are available yet." />}
    </section>
  )
}

export default Briefs
