function safeSourceUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
  } catch { return null }
}

// Render plain text rather than trusting model-generated HTML or Markdown.
function AssistantMessage({ message }) {
  return (
    <article className="assistant-message">
      <p className="assistant-speaker">{message.role === 'user' ? 'You' : 'Assistant'}</p>
      <p>{message.answer}</p>
      {message.role === 'assistant' && (
        <>
          <p className="assistant-confidence">Confidence: {message.confidence}</p>
          {message.sources.length > 0 && (
            <ul aria-label="Sources" className="assistant-sources">
              {message.sources.map(source => (
                <li key={source.id}>
                  {safeSourceUrl(source.sourceUrl) ? (
                    <a href={safeSourceUrl(source.sourceUrl)} target="_blank" rel="noopener noreferrer">{source.label}</a>
                  ) : <span>{source.label} — no official source link available</span>}
                  <span>Last verified: {source.lastVerified || 'Not recorded'}</span>
                  <span>Verification: {source.verification}</span>
                </li>
              ))}
            </ul>
          )}
          {message.warnings.map(warning => <p className="assistant-warning" key={warning}>Warning: {warning}</p>)}
        </>
      )}
    </article>
  )
}

export default AssistantMessage
