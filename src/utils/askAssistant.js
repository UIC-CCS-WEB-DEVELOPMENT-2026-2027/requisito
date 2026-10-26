// The browser calls our function; provider credentials never enter React.
export async function askAssistant(question, context = null, language = 'en') {
  const response = await fetch('/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, language, ...(context ? { context } : {}) }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Something went wrong.')
  return data
}
