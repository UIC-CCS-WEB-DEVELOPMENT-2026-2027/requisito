const COMPLETE_STATUSES = new Set(['ready', 'not-applicable'])

export function assessChecklistReadiness(requirements, items = {}, planValid = true) {
  if (!requirements.length) return { status: 'unavailable', missingPrerequisites: [] }
  if (!planValid) return { status: 'plan-needs-review', missingPrerequisites: [] }

  const missingPrerequisites = []
  for (const requirement of requirements) {
    for (const prerequisiteId of requirement.requires ?? []) {
      if (items[String(prerequisiteId)]?.status !== 'ready') {
        const id = String(prerequisiteId)
        if (!missingPrerequisites.includes(id)) missingPrerequisites.push(id)
      }
    }
  }

  if (missingPrerequisites.length) {
    return { status: 'missing-prerequisites', missingPrerequisites }
  }

  if (requirements.some((requirement) => requirement.verification !== 'verified')) {
    return { status: 'needs-verification', missingPrerequisites }
  }

  const statuses = requirements.map((requirement) =>
    items[String(requirement.id)]?.status ?? 'not-started',
  )
  if (statuses.every((status) => COMPLETE_STATUSES.has(status))) {
    return { status: 'ready-to-apply', missingPrerequisites }
  }
  if (statuses.some((status) => status === 'in-progress' || status === 'ready')) {
    return { status: 'preparing', missingPrerequisites }
  }
  return { status: 'not-started', missingPrerequisites }
}
