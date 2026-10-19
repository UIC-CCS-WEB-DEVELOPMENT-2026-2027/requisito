import RequirementCard from '../components/RequirementCard.jsx'

// Placeholder requirements until issue #8 data exists; verify every URL and date before demo.
const requirements = [
  {
    id: 'birth-certificate',
    label: 'PSA birth certificate',
    notes: 'A certified copy of your birth certificate.',
    copies: 1,
    sourceUrl: 'https://psa.gov.ph/',
    lastVerified: '2026-10-01',
  },
  {
    id: 'government-id',
    label: 'Valid government ID',
    notes: 'A current government-issued identification document.',
    copies: 1,
    sourceUrl: 'https://www.gov.ph/',
    lastVerified: '2026-10-01',
  },
  {
    id: 'barangay-clearance',
    label: 'Barangay clearance',
    notes: 'A clearance issued by your local barangay.',
    copies: 1,
    sourceUrl: 'https://www.dilg.gov.ph/',
    lastVerified: '2026-10-01',
  },
  {
    id: 'nbi-clearance',
    label: 'NBI clearance',
    notes: 'A clearance issued by the National Bureau of Investigation.',
    copies: 1,
    sourceUrl: 'https://nbi.gov.ph/',
    lastVerified: '2026-10-01',
  },
]

// Static progress until real requirement tracking exists.
const completed = 0
const total = requirements.length

function Checklist() {
  return (
    <section className="page-content" aria-labelledby="checklist-title">
      <p className="eyebrow">Required documents</p>
      <h1 id="checklist-title">Checklist</h1>
      <p className="page-description">
        These are the documents you need, in order.
      </p>
      <section className="checklist-progress" aria-labelledby="progress-label">
        <p id="progress-label">{completed} of {total} completed</p>
        <progress
          aria-label="Requirements completed"
          value={completed}
          max={total}
        >
          {completed} of {total} completed
        </progress>
      </section>
      <ol className="sprint-grid generated-plan" aria-label="Required documents">
        {requirements.map((req) => (
          <li key={req.id}>
            <RequirementCard
              label={req.label}
              notes={req.notes}
              copies={req.copies}
              sourceUrl={req.sourceUrl}
              lastVerified={req.lastVerified}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Checklist
