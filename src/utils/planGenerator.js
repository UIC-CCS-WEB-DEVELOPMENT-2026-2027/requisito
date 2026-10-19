// Adapted from Bruce's PR #42, commit 39986db (issue #9).
// Original algorithm retained; exported as an ES module for React integration.
/**
 * Build an ordered checklist of steps for a goal.
 *
 * @param {{ id?: string, requirements: string[] }} goal
 *   The goal. `requirements` lists the top-level requirement ids needed to reach it.
 * @param {Object<string, string | string[]>} answers
 *   The user's answers, keyed by question, e.g. { civilStatus: 'married' }.
 * @param {Array<Object>} requirements
 *   Every known requirement: { id, title?, when?, requires? }. See ASSUMPTIONS.
 *
 * @returns {{
 *   steps: Object[],       // the checklist, in the order it should be followed
 *   unresolved: Object[],  // steps that could not be ordered (cycle members, or blocked by one)
 *   cycles: string[][],    // each circular dependency, e.g. ['a', 'b', 'a']
 *   warnings: string[],    // human-readable problems with the input
 *   ok: boolean            // false if a circular dependency was found
 * }}
 *
 * ASSUMPTIONS ABOUT THE INPUT (change these here if issue #8 says otherwise)
 *  1. `when` is a filter: { questionKey: 'value' | ['value', ...] }. Every key must match.
 *     A question the user has not answered does NOT filter anything out.
 *  2. `requires` is a list of ids, or "any one of" groups: { anyOf: ['id', ...], label? }.
 *  3. Dependencies listed in `requires` are pulled in automatically. A requirement that does
 *     not apply to the user is dropped, and so is any dependency on it.
 *  4. An "any one of" group becomes ONE step. Its options are treated as standalone documents:
 *     their own `requires` are not followed. If an option is already in the plan for another
 *     reason, that option satisfies the group and no extra step is added.
 *  5. Steps that don't depend on each other keep the order of the `requirements` array.
 *
 * The function never throws on bad data; problems are reported in `warnings` / `cycles`.
 */
export function generatePlan(goal, answers = {}, requirements = []) {
  const warnings = []
  const warn = (message) => {
    if (!warnings.includes(message)) warnings.push(message)
  }

  if (!goal || !Array.isArray(goal.requirements)) {
    warn('Goal is missing or has no "requirements" list.')
    return { steps: [], unresolved: [], cycles: [], warnings, ok: false }
  }

  // id -> { req, rank }. `rank` is the position in the list, used to keep ordering stable.
  const catalog = new Map(requirements.map((req, rank) => [req.id, { req, rank }]))
  const nodes = new Map() // id -> one node per step in the plan

  // Step 1 - Collect: the goal's requirements that apply to this user, plus their dependencies.
  function collect(id, requestedBy) {
    if (nodes.has(id)) return
    const entry = catalog.get(id)
    if (!entry) return warn(`${requestedBy} refers to unknown requirement "${id}".`)
    if (!appliesTo(entry.req, answers)) return

    nodes.set(id, { id, kind: 'requirement', rank: entry.rank, req: entry.req })
    for (const dep of entry.req.requires ?? []) {
      if (typeof dep === 'string') collect(dep, `"${id}"`)
    }
  }
  goal.requirements.forEach((id) => collect(id, `Goal "${goal.id ?? '?'}"`))

  // Step 2 - Link: record which steps each step must come after.
  for (const node of [...nodes.values()]) {
    node.needs = new Set()
    for (const dep of node.req.requires ?? []) {
      if (typeof dep === 'string') {
        if (nodes.has(dep)) node.needs.add(dep)
      } else if (Array.isArray(dep?.anyOf)) {
        const target = resolveAnyOf(dep, node.id)
        if (target) node.needs.add(target)
      }
    }
  }

  // Turn an "any one of" group into the id of the step that satisfies it.
  function resolveAnyOf(group, requestedBy) {
    const options = group.anyOf.filter((id) => {
      const entry = catalog.get(id)
      if (!entry) warn(`"${requestedBy}" refers to unknown requirement "${id}".`)
      return entry && appliesTo(entry.req, answers)
    })
    if (options.length === 0) {
      warn(`"${requestedBy}" has an "any one of" group with no usable options.`)
      return null
    }

    const alreadyNeeded = options.find((id) => nodes.has(id))
    if (alreadyNeeded) return alreadyNeeded

    const key = `anyOf:${[...options].sort().join('|')}` // same options -> same shared step
    if (!nodes.has(key)) {
      nodes.set(key, {
        id: key,
        kind: 'anyOf',
        rank: Math.min(...options.map((id) => catalog.get(id).rank)),
        label: group.label,
        options: options.map((id) => ({ id, title: titleOf(catalog.get(id).req) })),
        needs: new Set(),
      })
    }
    return key
  }

  // Step 3 - Sort: repeatedly take the earliest step whose prerequisites are all done.
  const remaining = new Map(nodes)
  const done = new Set()
  const steps = []
  while (remaining.size > 0) {
    const ready = [...remaining.values()]
      .filter((node) => [...node.needs].every((id) => done.has(id)))
      .sort((a, b) => a.rank - b.rank)
    if (ready.length === 0) break // everything left is stuck behind a cycle

    const next = ready[0]
    remaining.delete(next.id)
    done.add(next.id)
    steps.push(toStep(next, steps.length + 1))
  }

  // Step 4 - Report: whatever is left over is in, or blocked by, a circular dependency.
  const cycles = findCycles(remaining)
  const inCycle = new Set(cycles.flat())
  const unresolved = [...remaining.values()].map((node) => ({
    id: node.id,
    title: titleOfNode(node),
    inCycle: inCycle.has(node.id),
  }))
  if (cycles.length > 0) {
    warn(`Circular dependency: ${cycles.map((cycle) => cycle.join(' -> ')).join('; ')}`)
  }

  return { steps, unresolved, cycles, warnings, ok: cycles.length === 0 }
}

/** Does this requirement apply, given the user's answers? (assumption 1) */
function appliesTo(requirement, answers = {}) {
  const when = requirement.when
  if (!when) return true

  return Object.entries(when).every(([question, expected]) => {
    const actual = answers[question]
    if (actual === undefined || actual === null || actual === '') return true // unanswered
    const accepted = Array.isArray(expected) ? expected : [expected]
    return Array.isArray(actual)
      ? actual.some((value) => accepted.includes(value))
      : accepted.includes(actual)
  })
}

// ---- small helpers ----

const titleOf = (requirement) => requirement.title ?? requirement.id

function titleOfNode(node) {
  if (node.kind === 'requirement') return titleOf(node.req)
  return node.label ?? `Any one of: ${node.options.map((option) => option.title).join(' / ')}`
}

/** Shape one node as an entry in the returned checklist. */
function toStep(node, order) {
  const requires = [...node.needs]
  if (node.kind === 'anyOf') {
    return { order, id: node.id, kind: 'anyOf', title: titleOfNode(node), options: node.options, requires }
  }
  // `when` and `requires` were only for planning; the rest (title, notes, ...) is passed through.
  // eslint-disable-next-line no-unused-vars
  const { when, requires: _requires, ...details } = node.req
  return { ...details, order, id: node.id, kind: 'requirement', requires }
}

/** Find loops among the steps that could not be ordered. Each loop is e.g. ['a', 'b', 'a']. */
function findCycles(stuck) {
  const cycles = []
  const state = new Map() // 1 = on the current path, 2 = finished
  const path = []

  function visit(id) {
    state.set(id, 1)
    path.push(id)
    for (const dep of stuck.get(id).needs) {
      if (!stuck.has(dep)) continue
      if (state.get(dep) === 1) cycles.push([...path.slice(path.indexOf(dep)), dep])
      else if (!state.has(dep)) visit(dep)
    }
    path.pop()
    state.set(id, 2)
  }

  for (const id of stuck.keys()) if (!state.has(id)) visit(id)
  return cycles
}