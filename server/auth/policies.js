export function wouldRemoveLastActiveAdmin(existing, nextRole, nextDisabled, activeAdminCount) {
  return existing.role === 'admin' &&
    !existing.disabled &&
    (nextRole !== 'admin' || nextDisabled) &&
    activeAdminCount <= 1
}
