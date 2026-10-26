function getUsableAddress(address) {
  if (typeof address !== 'string') return null

  const location = address.trim()
  if (
    location.length < 3 ||
    location.length > 200 ||
    [...location].some((character) => {
      const code = character.charCodeAt(0)
      return code <= 0x1f || code === 0x7f
    }) ||
    /^[a-z][a-z\d+.-]*:/i.test(location) ||
    /\b(?:announcement|confirm(?:ed|ation)?|current(?:ly)?|listed|must|please|reported|schedule|venue|will)\b/i.test(location)
  ) {
    return null
  }

  return location
}

export function buildGoogleMapsQuery(title, address) {
  const location = getUsableAddress(address)
  if (!location) return null

  const name = typeof title === 'string' ? title.trim() : ''
  return name ? `${name}, ${location}` : location
}

export function getGoogleMapsSearchUrl(title, address) {
  const query = buildGoogleMapsQuery(title, address)
  if (!query) return null

  const url = new URL('https://www.google.com/maps/search/')
  url.searchParams.set('api', '1')
  url.searchParams.set('query', query)
  return url.toString()
}

export function getGoogleMapsDirectionsUrl(title, address) {
  const query = buildGoogleMapsQuery(title, address)
  if (!query) return null

  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('destination', query)
  return url.toString()
}
