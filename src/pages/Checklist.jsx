import RequirementCard from '../components/RequirementCard.jsx'
import { getRequirementsByGoal } from '../data/helpers.js'

// Props: none. The First Job requirement list comes from helpers.js.
function Checklist() {
  const requirements = getRequirementsByGoal(1)
  const done = requirements.filter((requirement) => requirement.status === 'done').length
  return (
    <section className="page-content" aria-labelledby="checklist-title">
      <p className="eyebrow">First Job</p>
      <h1 id="checklist-title">Your preparation checklist</h1>
      <p className="sample-notice">Sample content, to be verified against official sources. All requirements are unverified. Dates shown as ?Last verified? are sample values, not evidence of verification.</p>
      <div className="checklist-progress">
        <p>{done} of {requirements.length} requirements done (static sample)</p>
        <progress aria-label="Sample requirements completion" value={done} max={requirements.length || 1} />
      </div>
      <div className="sprint-grid">
        {requirements.map((requirement) => (
          <RequirementCard key={requirement.id} label={requirement.label} notes={requirement.notes} copies={requirement.copies} sourceUrl={requirement.sourceUrl} lastVerified={requirement.lastVerified} />
        ))}
      </div>
    </section>
  )
}

export default Checklist
