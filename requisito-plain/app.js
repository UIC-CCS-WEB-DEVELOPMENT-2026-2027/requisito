// ---- UI ----
const $ = id => document.getElementById(id)
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e }

function render() {
  const reqs = baseRequirements.map(r => ({ ...r }))
  if ($('cycle').checked) reqs.find(r => r.id === 'barangay-clearance').requires = [ID_GROUP, 'nbi-clearance']
  const goal = { id: 'first-job', requirements: ['nbi-clearance', 'tin', 'sss', 'philhealth'] }
  if ($('passport').checked) goal.requirements.push('passport')
  const plan = generatePlan(goal, { civilStatus: $('civil').value }, reqs)
  const titles = new Map(plan.steps.map(s => [s.id, s.title]))

  const ol = $('steps'); ol.replaceChildren()
  for (const s of plan.steps) {
    const li = el('li', 'checklist-item' + (s.kind === 'anyOf' ? ' is-choice' : ''))
    const row = el('div', 'step-row')
    row.append(el('span', 'goal-number', String(s.order).padStart(2, '0')))
    const body = el('div'); body.append(el('div', 'step-title', s.title))
    if (s.kind === 'anyOf') {
      body.append(el('div', 'step-sub', 'Pick whichever you can get most easily.'))
      const chips = el('div', 'chips'); s.options.forEach(o => chips.append(el('span', 'chip', o.title))); body.append(chips)
    }
    if (s.requires.length) body.append(el('div', 'step-sub', 'Needs first: ' + s.requires.map(id => titles.get(id) ?? id).join(', ')))
    row.append(body); li.append(row); ol.append(li)
  }

  const p = $('problems'); p.replaceChildren()
  if (!plan.ok) {
    const box = el('div', 'problem'); box.setAttribute('role', 'alert')
    box.append(el('strong', '', 'Circular dependency found. The app keeps running.'))
    plan.cycles.forEach(c => box.append(el('code', '', c.join(' \u2192 '))))
    box.append(el('div', 'step-sub', 'Not ordered: ' + plan.unresolved.map(u => u.title + (u.inCycle ? '' : ' (blocked)')).join(', ')))
    p.append(box)
  }
  $('raw').textContent = JSON.stringify({ ok: plan.ok, steps: plan.steps.map(({ order, id, kind, requires }) => ({ order, id, kind, requires })), cycles: plan.cycles, unresolved: plan.unresolved, warnings: plan.warnings }, null, 2)
}
;['civil', 'passport', 'cycle'].forEach(id => $(id).addEventListener('change', render))
render()