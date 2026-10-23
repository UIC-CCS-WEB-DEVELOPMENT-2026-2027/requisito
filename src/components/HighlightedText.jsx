import { normalizeSearchText } from '../data/barangayDirectory.js'

function foldCharacter(character) {
  return character.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function rangesFor(text, query) {
  const originalCharacters = Array.from(text)
  const foldedCharacters = originalCharacters.map(foldCharacter)
  const foldedText = foldedCharacters.join('')
  const foldedQuery = normalizeSearchText(query)
  const start = foldedText.indexOf(foldedQuery)
  if (start < 0 || !foldedQuery) return null
  let foldedOffset = 0
  let originalStart = -1
  let originalEnd = -1
  foldedCharacters.forEach((character, index) => {
    const endOffset = foldedOffset + character.length
    if (originalStart < 0 && start < endOffset) originalStart = index
    if (endOffset >= start + foldedQuery.length && originalEnd < 0) originalEnd = index + 1
    foldedOffset = endOffset
  })
  return originalStart < 0 || originalEnd < 0 ? null : [originalStart, originalEnd]
}

function HighlightedText({ text, query }) {
  const range = rangesFor(text, query)
  if (!range) return text
  const characters = Array.from(text)
  const [start, end] = range
  return (
    <>
      {characters.slice(0, start).join('')}
      <mark>{characters.slice(start, end).join('')}</mark>
      {characters.slice(end).join('')}
    </>
  )
}

export default HighlightedText
