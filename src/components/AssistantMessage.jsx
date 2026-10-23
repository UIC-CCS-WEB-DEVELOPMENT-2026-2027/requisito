import { useLanguage } from '../i18n/LanguageContext.jsx'

function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch { return null }
}

// Render plain text rather than trusting model-generated HTML or Markdown.
function AssistantMessage({ message }) {
  const { t } = useLanguage()

  return (
    <article className="assistant-message">
      <p className="assistant-speaker">{message.role === 'user' ? t('assistant.you') : t('assistant.assistant')}</p>
      <p>{message.answer}</p>
      {message.role === 'assistant' && (
        <>
          <p className="assistant-confidence">{t('assistant.confidence')} {message.confidence}</p>
          {message.sources.length > 0 && (
            <ul aria-label={t('assistant.sources')} className="assistant-sources">
              {message.sources.map(source => (
                <li key={source.id}>
                  {safeSourceUrl(source.sourceUrl) ? (
                    <a href={safeSourceUrl(source.sourceUrl)} target="_blank" rel="noopener noreferrer">{source.label}</a>
                  ) : <span>{source.label} — {t('assistant.noSource')}</span>}
                  <span>{t('assistant.lastVerified')} {source.lastVerified || t('assistant.notRecorded')}</span>
                  <span>{t('assistant.verification')} {source.verification}</span>
                </li>
              ))}
            </ul>
          )}
          {message.warnings.map(warning => <p className="assistant-warning" key={warning}>{t('assistant.warning')} {warning}</p>)}
        </>
      )}
    </article>
  )
}

export default AssistantMessage
