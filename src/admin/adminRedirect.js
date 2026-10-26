export function getAdminSignInDestination(locationState) {
  const from = locationState?.from
  if (!from?.pathname || (from.pathname !== '/admin' && !from.pathname.startsWith('/admin/'))) {
    return '/admin'
  }
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}
