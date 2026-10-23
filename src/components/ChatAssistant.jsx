import { useRef, useState } from 'react'
import { askAssistant } from '../utils/askAssistant.js'
import EmptyState from './EmptyState.jsx'
import AssistantMessage from './AssistantMessage.jsx'
import './ChatAssistant.css'

function ChatAssistant() {
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
    if (!question) { setError('Please enter a question.'); return }
    if (question.length > 500) { setError('Keep your question within 500 characters.'); return }
    if (Date.now() - lastSentAt.current < 2000) { setError('Please wait two seconds between questions.'); return }
    lastSentAt.current = Date.now()
    setLoading(true)
    setMessages(previous => [...previous, { id: crypto.randomUUID(), role: 'user', answer: question }])
    setInput('')
    try {
      const answer = await askAssistant(question)
      setMessages(previous => [...previous, { ...answer, id: crypto.randomUUID(), role: 'assistant' }])
    } catch (failure) {
      const inputErrors = ["Please don't share ID numbers or personal details.", 'Please wait a minute before trying again.']
      setError(inputErrors.includes(failure.message) ? failure.message : 'The assistant is unavailable. Try again later.')
    } finally { setLoading(false) }
  }

  return (
    <section className="chat-assistant" aria-labelledby="assistant-title">
      <h2 id="assistant-title">Ask about your requirements</h2>
      <p>Guidance only. Confirm with the issuing office.</p>
      <p id="assistant-privacy">Don't type ID numbers or personal details. Messages are sent to an AI service.</p>
      <div className="assistant-log" role="log" aria-label="Assistant conversation" aria-live="polite">
        {messages.length ? messages.map(message => <AssistantMessage key={message.id} message={message} />)
          : <EmptyState message="Ask a question about your requirements" />}
      </div>
      <form className="assistant-form" onSubmit={handleSubmit}>
        <label htmlFor="assistant-question">Your question</label>
        <textarea id="assistant-question" rows="3" value={input} aria-describedby="assistant-privacy assistant-length"
          onChange={e => { setInput(e.target.value); setError('') }} />
        <p id="assistant-length">{input.length}/500 characters</p>
        <button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send question'}</button>
      </form>
      {loading && <p role="status">Waiting for the assistant…</p>}
      {error && <p className="assistant-error" role="alert">{error}</p>}
    </section>
  )
}

export default ChatAssistant
