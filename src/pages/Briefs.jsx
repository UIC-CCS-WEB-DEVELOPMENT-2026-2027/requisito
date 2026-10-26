import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import RecordMeta from '../components/RecordMeta.jsx'
import { getBriefs } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { href } from '../routeManifest.js'

function Briefs() {
  const { t } = useLanguage()
  const briefs = getBriefs()
  return (
    <section className="page-content flow-content" aria-labelledby="briefs-title">
      <p className="eyebrow">{t('briefs.eyebrow')}</p>
      <h1 id="briefs-title">{t('page.briefs')}</h1>
      <p className="page-description">{t('briefs.description')}</p>
      {briefs.length ? (
        <div className="portal-grid">
          {briefs.map((brief) => (
            <article className="portal-card" key={brief.id}>
              <h2>{brief.title}</h2>
              <p>{brief.description}</p>
              {brief.timeSensitive && <p className="time-sensitive">{t('briefs.confirmCurrent')}</p>}
              <h3>{t('label.steps')}</h3>
              <ol>{brief.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              {brief.whatYouNeed.length > 0 && <>
                <h3>{t('label.whatYouNeed')}</h3>
                <ul>{brief.whatYouNeed.map((item) => <li key={item}>{item}</li>)}</ul>
              </>}
              <RecordMeta record={brief} />
              <p><Link to={href('contribute', {}, { record: brief.slug })}>{t('common.reportCorrection')}</Link></p>
            </article>
          ))}
        </div>
      ) : <EmptyState message={t('briefs.empty')} />}
    </section>
  )
}

export default Briefs
