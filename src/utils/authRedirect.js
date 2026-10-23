export function getSignInDestination(locationState) {
  return locationState?.from ?? '/'
}
