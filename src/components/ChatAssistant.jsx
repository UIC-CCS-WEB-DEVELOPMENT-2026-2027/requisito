import { useRef, useState } from 'react'
import { askAssistant } from '../utils/askAssistant.js'
import EmptyState from './EmptyState.jsx'
import AssistantMessage from './AssistantMessage.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import './ChatAssistant.css'

function ChatAssistant() {
  const { t } = useLanguage()
  // Conversation stays here so it disappears when the checklist is left.
  const [messages, setMessages] = useState([])
  // Input state makes React the source of truth for the controlled textarea.
  const [input, setInput] = useState('')
  // Loading lives here to prevent another send while this form is waiting.
  const [loading, setLoading] = useState(false)
  // Error state lets this form show validation and request failures as text.
  const [error, setError] = useState('')
  const lastSentAt = useRef(0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError('')
    const question = input.trim()
    if (!question) { setError(t('assistant.emptyQuestion')); return }
    if (question.length > 500) { setError(t('assistant.tooLong')); return }
    if (Date.now() - lastSentAt.current < 2000) { setError(t('assistant.rateLimit')); return }
    lastSentAt.current = Date.now()
    setLoading(true)
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', answer: question }])
    setInput('')
    try {
      const answer = await askAssistant(question)
      setMessages(previous => [...previous, { ...answer, id: crypto.randomUUID(), role: 'assistant' }])
    } catch (failure) {
      const inputErrors = ["Please don't share ID numbers or personal details.", 'Please wait a minute before trying again.']
      const translatedError = failure.message === inputErrors[0]
        ? t('assistant.noPersonalDetails')
        : failure.message === inputErrors[1] ? t('assistant.waitMinute') : t('assistant.unavailable')
      setError(translatedError)
    } finally { setLoading(false) }
  }

  return (
    <section className="chat-assistant" aria-labelledby="assistant-title">
      <h2 id="assistant-title">{t('assistant.title')}</h2>
      <p>{t('assistant.guidance')}</p>
      <p id="assistant-privacy">{t('assistant.privacy')}</p>
      <div className="assistant-log" role="log" aria-label={t('a11y.assistantConversation')} aria-live="polite">
        {messages.length ? messages.map(message => <AssistantMessage key={message.id} message={message} />)
          : <EmptyState message={t('assistant.emptyPrompt')} />}
      </div>
      <form className="assistant-form" onSubmit={handleSubmit}>
        <label htmlFor="assistant-question">{t('assistant.question')}</label>
        <textarea id="assistant-question" rows="3" value={input} aria-describedby="assistant-privacy assistant-length"
          onChange={e => { setInput(e.target.value); setError('') }} />
        <p id="assistant-length">{t('assistant.length').replace('{current}', input.length)}</p>
        <button type="submit" disabled={loading}>{loading ? t('assistant.sending') : t('assistant.send')}</button>
      </form>
      {loading && <p role="status">{t('assistant.waiting')}</p>}
      {error && <p className="assistant-error" role="alert">{error}</p>}
    </section>
  )
}

export default ChatAssistant
