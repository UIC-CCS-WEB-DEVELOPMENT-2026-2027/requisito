import { getServiceBySlug } from '../data/helpers.js'

// The server resolves this stable record reference again and applies verification rules.
export function getPageContext(pathname) {
  const match = pathname.match(/^\/services\/([^/]+)\/?$/)
  if (!match) return null
  let slug
  try {
    slug = decodeURIComponent(match[1])
  } catch {
    return null
  }
  const service = getServiceBySlug(slug)
  return service ? { type: service.type, slug: service.slug } : null
}
