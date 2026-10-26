import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { adminRequest } from './api.js'
import { useAdminAuth } from './AdminAuthContext.js'
import { getAdminSignInDestination } from './adminRedirect.js'
import firstJobEvidence from '../data/firstJobEvidence.json'

const recordTypes = [
  'services', 'barangays', 'officials', 'cityFacts', 'updates', 'history',
  'budget', 'procurement', 'briefs', 'elections', 'accountability', 'requirements',
  'requirementSources',
]
const firstJobEvidenceById = new Map(
  firstJobEvidence.requirements.map((entry) => [entry.requirementId, entry]),
)

function useResource(path) {
  const [revision, setRevision] = useState(0)
  const requestKey = `${path}:${revision}`
  const [resource, setResource] = useState({ key: '', data: null, error: '', loading: true })
  useEffect(() => {
    const controller = new AbortController()
    adminRequest(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResource({ key: requestKey, data, error: '', loading: false })
      })
      .catch((failure) => {
        if (!controller.signal.aborted) {
          setResource({ key: requestKey, data: null, error: failure.message, loading: false })
        }
      })
    return () => controller.abort()
  }, [path, requestKey])
  const currentResource = resource.key === requestKey ? resource : null
  return {
    data: currentResource?.data ?? null,
    error: currentResource?.error ?? '',
    loading: currentResource?.loading ?? true,
    reload: () => setRevision((value) => value + 1),
  }
}

function Loading({ children = 'Loading…' }) {
  return <p role="status">{children}</p>
}

function ErrorMessage({ message }) {
  return message ? <p className="admin-error" role="alert">{message}</p> : null
}

function EmptyMessage({ children }) {
  return <p className="admin-notice" role="status">{children}</p>
}

export function AdminLoginPage() {
  const { status, login } = useAdminAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && location.pathname === '/admin/login') navigate('/admin', { replace: true })
  }, [status, location.pathname, navigate])

  if (status === 'loading') return <main className="admin-layout"><Loading>Checking admin session…</Loading></main>
  if (status === 'error' || status === 'forbidden') {
    return <main className="admin-layout"><ErrorMessage message={status === 'forbidden' ? `Access denied (403): ${error}` : error} /></main>
  }

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(username.trim(), password)
      navigate(getAdminSignInDestination(location.state), { replace: true })
    } catch (failure) {
      setError(failure.message)
    } finally {
      setPassword('')
      setSubmitting(false)
    }
  }

  return (
    <main className="admin-layout">
      <section className="admin-card" aria-labelledby="admin-login-title">
        <p className="admin-eyebrow">Restricted area · no public sign-up</p>
        <h1 id="admin-login-title">Admin sign in</h1>
        <form className="admin-form" onSubmit={submit} noValidate>
          <label htmlFor="admin-username">Username
            <input id="admin-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'admin-login-error' : undefined} />
          </label>
          <label htmlFor="admin-password">Password
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'admin-login-error' : undefined} />
          </label>
          <ErrorMessage message={error} />
          {error && <span id="admin-login-error" className="visually-hidden">{error}</span>}
          <button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p><Link to="/">Return to public site</Link></p>
      </section>
    </main>
  )
}

export function AdminDashboard() {
  const { data, error, loading } = useResource('/admin/summary')
  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  const total = data.unverifiedByType.reduce((sum, item) => sum + item.count, 0)
  return (
    <>
      <h1>Admin dashboard</h1>
      <p className="admin-notice">{total} records are not currently verified. A verification request requires approval by a different reviewer.</p>
      <h2>Unverified by collection</h2>
      {data.unverifiedByType.length ? (
        <ul className="admin-grid">{data.unverifiedByType.map((item) => <li className="admin-card" key={item.type}><h3>{item.type}</h3><p>{item.count}</p><Link to={`/admin/records?type=${encodeURIComponent(item.type)}&verification=unverified`}>Review records</Link></li>)}</ul>
      ) : <EmptyMessage>{data.totalRecords ? 'All imported records are verified.' : 'No records are imported yet. Run npm run db:import to load the catalogs.'}</EmptyMessage>}
      <h2>Pending verification requests ({data.pendingRequests})</h2>
      {data.pendingRequests ? <p><Link to="/admin/review">Open review queue</Link></p> : <EmptyMessage>No verification requests are pending.</EmptyMessage>}
      <h2>Recent audit activity</h2>
      {data.recentAudit.length ? (
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Record</th><th>Note</th></tr></thead><tbody>
          {data.recentAudit.map((entry) => <tr key={entry.id}><td>{entry.at}</td><td>{entry.actor}</td><td>{entry.action}</td><td>{entry.record_type ? `${entry.record_type} ${entry.record_id}` : '—'}</td><td>{entry.note}</td></tr>)}
        </tbody></table></div>
      ) : <EmptyMessage>No audit entries yet.</EmptyMessage>}
    </>
  )
}

function buildRecordQuery(params, page = 1) {
  const query = new URLSearchParams(params)
  query.set('limit', '50')
  query.set('page', String(page))
  return query.toString()
}

export function AdminRecords() {
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get('type') ?? ''
  const district = searchParams.get('district') ?? ''
  const verification = searchParams.get('verification') ?? ''
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)
  const query = buildRecordQuery(searchParams, page)
  const { data, error, loading } = useResource(`/records?${query}`)
  const population = useResource('/admin/population-summary')

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  function changePage(nextPage) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <>
      <h1>Records</h1>
      <form className="admin-filters" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="admin-record-type">Collection
          <select id="admin-record-type" value={type} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value="">All collections</option>
            {recordTypes.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
        <label htmlFor="admin-record-district">District
          <input id="admin-record-district" value={district} onChange={(event) => updateFilter('district', event.target.value)} placeholder="Filter by district" />
        </label>
        <label htmlFor="admin-record-verification">Verification
          <select id="admin-record-verification" value={verification} onChange={(event) => updateFilter('verification', event.target.value)}>
            <option value="">All states</option><option value="unverified">Unverified</option><option value="verified">Verified</option><option value="conflicting">Conflicting</option>
          </select>
        </label>
      </form>
      {type === 'barangays' && (
        <section className="admin-card" aria-labelledby="population-check-title">
          <h2 id="population-check-title">Barangay population sum check</h2>
          {population.loading ? <Loading /> : population.error ? <ErrorMessage message={population.error} /> : population.data.officialTotal == null
            ? <p>Official population total is not available in the imported city facts.</p>
            : <>
              <p>Current sum: {population.data.currentSum.toLocaleString()} ({population.data.populatedCount} populated records)</p>
              <p>Official total from city facts: {population.data.officialTotal.toLocaleString()} ({population.data.sourceVerification ?? 'unverified'})</p>
              <p>Difference (current minus official): {population.data.difference.toLocaleString()}</p>
            </>}
        </section>
      )}
      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : data.total === 0
        ? <EmptyMessage>No records match these filters.</EmptyMessage>
        : <>
          <p aria-live="polite">Showing {data.records.length} of {data.total} records · page {data.page}</p>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Type</th><th>ID</th><th>Title</th><th>District</th><th>Verification</th><th>Last verified</th></tr></thead><tbody>
            {data.records.map((record) => <tr key={`${record.type}:${record.id}`}><td>{record.type}</td><td>{record.id}</td><td><Link to={`/admin/records/${encodeURIComponent(record.type)}/${encodeURIComponent(record.id)}`}>{record.title ?? record.label ?? record.slug}</Link></td><td>{record.adminDistrict ?? record.legislativeDistrict ?? '—'}</td><td>{record.verification}</td><td>{record.lastVerified ?? '—'}</td></tr>)}
          </tbody></table></div>
          <div className="admin-pagination">
            <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous page</button>
            <button type="button" disabled={page * data.limit >= data.total} onClick={() => changePage(page + 1)}>Next page</button>
          </div>
        </>}
    </>
  )
}

const editableRecordKeys = ['title', 'description', 'category', 'sourceUrl', 'notes']
const editableSourceKeys = [
  'agency', 'title', 'url', 'publishedDate', 'statementDate', 'effectiveDate',
  'evidenceType', 'supports', 'limitations', 'relatedSources',
]

export function AdminRecordDetail() {
  const { type = '', id = '' } = useParams()
  const path = `/records/${encodeURIComponent(type)}/${encodeURIComponent(id)}`
  const { data, error, loading, reload } = useResource(path)
  const history = useResource(`${path}/verification`)
  const { user } = useAdminAuth()
  const isRequirementSource = type === 'requirementSources'
  const editableKeys = isRequirementSource ? editableSourceKeys : editableRecordKeys
  const [draft, setDraft] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [sourceAccessedOn, setSourceAccessedOn] = useState('')
  const [verificationNote, setVerificationNote] = useState('')
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const editable = user.role !== 'viewer'

  const record = data?.record
  function fieldValue(key) {
    const value = record?.[key]
    return ['supports', 'relatedSources'].includes(key)
      ? JSON.stringify(value ?? [], null, 2)
      : value ?? ''
  }
  const fields = draft ?? (record ? Object.fromEntries([
    ...[...editableKeys, ...(type === 'barangays' ? ['adminDistrict', 'legislativeDistrict'] : [])]
      .map((key) => [key, fieldValue(key)]),
    ...(type === 'barangays' ? [['population2020', record.population2020 ?? '']] : []),
  ]) : null)
  function setField(key, value) {
    setDraft({ ...fields, [key]: value })
  }

  async function saveRecord(event) {
    event.preventDefault()
    if (!fields) return
    setSaving(true)
    setActionError('')
    setMessage('')
    try {
      const nextFields = { ...fields }
      if (isRequirementSource) {
        for (const key of ['supports', 'relatedSources']) {
          try {
            nextFields[key] = JSON.parse(nextFields[key])
          } catch {
            throw new Error(`${key} must be valid JSON.`)
          }
          if (!Array.isArray(nextFields[key])) throw new Error(`${key} must be a JSON array.`)
        }
        for (const key of ['publishedDate', 'statementDate', 'effectiveDate']) {
          if (nextFields[key] === '') nextFields[key] = null
        }
      }
      if (type === 'barangays') {
        const text = String(nextFields.population2020).trim()
        nextFields.population2020 = text === '' ? null : Number(text)
      }
      const result = await adminRequest(path, {
        method: 'PATCH',
        body: {
          data: nextFields,
          source_url: nextFields.sourceUrl ?? nextFields.url ?? '',
          note: editNote,
        },
      })
      setMessage(result.record.verification === 'unverified' && data.record.verification === 'verified'
        ? 'Saved; the record is unverified again and needs a new two-person review.'
        : 'Record saved and audit entry written.')
      setDraft(null)
      setEditNote('')
      reload()
      history.reload()
    } catch (failure) {
      setActionError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  async function requestVerification(event) {
    event.preventDefault()
    setSaving(true)
    setActionError('')
    setMessage('')
    try {
      await adminRequest(`${path}/verification`, {
        method: 'POST',
        body: {
          source_url: fields?.sourceUrl ?? fields?.url ?? data.record.sourceUrl ?? data.record.url,
          source_accessed_on: sourceAccessedOn,
          note: verificationNote,
        },
      })
      setMessage('Verification request submitted. A different reviewer or admin must decide it.')
      setSourceAccessedOn('')
      setVerificationNote('')
      history.reload()
    } catch (failure) {
      setActionError(failure.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  if (!data?.record) return <EmptyMessage>Record not found.</EmptyMessage>
  return (
    <>
      <p><Link to="/admin/records">← Records</Link></p>
      <h1>{record.title ?? record.label ?? record.slug}</h1>
      <p>Collection: {type} · ID: {record.id} · Verification: {record.verification} · Last verified: {record.lastVerified ?? 'Not verified'}</p>
      {!editable && <p className="admin-notice">Viewer access is read-only.</p>}
      {fields && <form className="admin-form admin-card" onSubmit={saveRecord}>
        <h2>Edit record</h2>
        {editableKeys.map((key) => <label htmlFor={`record-${key}`} key={key}>{key}
          {key === 'description' || key === 'notes' || key === 'limitations' ||
          key === 'supports' || key === 'relatedSources'
            ? <textarea id={`record-${key}`} value={fields[key]} disabled={!editable} onChange={(event) => setField(key, event.target.value)} />
            : <input id={`record-${key}`} type={key === 'url' || key === 'sourceUrl' ? 'url' : 'text'} value={fields[key]} disabled={!editable} onChange={(event) => setField(key, event.target.value)} />}
        </label>)}
        {type === 'barangays' && <>
          <label htmlFor="record-adminDistrict">Administrative district<input id="record-adminDistrict" value={fields.adminDistrict} disabled={!editable} onChange={(event) => setField('adminDistrict', event.target.value)} /></label>
          <label htmlFor="record-legislativeDistrict">Legislative district<input id="record-legislativeDistrict" value={fields.legislativeDistrict} disabled={!editable} onChange={(event) => setField('legislativeDistrict', event.target.value)} /></label>
          <label htmlFor="record-population2020">2020 population (blank means unavailable)<input id="record-population2020" type="number" min="0" step="1" value={fields.population2020} disabled={!editable} onChange={(event) => setField('population2020', event.target.value)} aria-invalid={Boolean(actionError)} aria-describedby={actionError ? 'record-save-error' : undefined} /></label>
        </>}
        <label htmlFor="record-edit-note">Edit note
          <textarea id="record-edit-note" value={editNote} disabled={!editable} onChange={(event) => setEditNote(event.target.value)} aria-describedby="record-edit-note-help" />
        </label>
        <span id="record-edit-note-help">Population changes require an official HTTPS source and a note.</span>
        <p id="record-save-error" className="admin-error" role="alert">{actionError}</p>
        <button type="submit" disabled={!editable || saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        <p role="status">{message}</p>
      </form>}
      {record.verification !== 'verified' && <form className="admin-form admin-card" onSubmit={requestVerification}>
        <h2>Request verification</h2>
        <label htmlFor="verification-source">Official HTTPS source URL<input id="verification-source" type="url" value={fields?.sourceUrl ?? fields?.url ?? record.sourceUrl ?? record.url ?? ''} readOnly /></label>
        <label htmlFor="verification-accessed">Date source was accessed<input id="verification-accessed" type="date" required value={sourceAccessedOn} disabled={!editable} onChange={(event) => setSourceAccessedOn(event.target.value)} /></label>
        <label htmlFor="verification-note">What exactly did you compare?<textarea id="verification-note" required minLength="10" value={verificationNote} disabled={!editable} onChange={(event) => setVerificationNote(event.target.value)} /></label>
        <ErrorMessage message={actionError} />
        <button type="submit" disabled={!editable || saving}>{saving ? 'Submitting…' : 'Submit verification request'}</button>
      </form>}
      <section className="admin-card">
        <h2>Verification history and record audit</h2>
        {history.loading ? <Loading /> : history.error ? <ErrorMessage message={history.error} /> : <>
          <h3>Requests</h3>
          {history.data.requests.length ? <ul>{history.data.requests.map((item) => <li key={item.id}>
            #{item.id}: {item.status}, submitted by {item.requested_by_name}, source {item.source_url}, accessed {item.source_accessed_on}; comparison: {item.note}
            {item.decided_by_name && <> Decision by {item.decided_by_name} on {item.decided_at}: {item.decision_note}</>}
          </li>)}</ul> : <EmptyMessage>No verification requests yet.</EmptyMessage>}
          <h3>Audit entries</h3>
          {history.data.audit.length ? <ol>{history.data.audit.map((entry) => <li key={entry.id}>{entry.at} · {entry.actor} · {entry.action} · {entry.note}</li>)}</ol> : <EmptyMessage>No audit entries yet.</EmptyMessage>}
        </>}
      </section>
    </>
  )
}

export function AdminReview() {
  const { user } = useAdminAuth()
  const { data, error, loading, reload } = useResource('/review')
  const sourceRecords = useResource('/records?type=requirementSources&limit=100')
  const [busy, setBusy] = useState(0)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [reviewNotes, setReviewNotes] = useState({})

  async function decide(requestId, decision) {
    const note = reviewNotes[requestId]?.trim() ?? ''
    if (note.length < 10 || note.length > 2000) {
      setActionError('Write a substantive review note between 10 and 2000 characters.')
      return
    }
    setBusy(requestId)
    setActionError('')
    setMessage('')
    try {
      await adminRequest(`/review/${requestId}/decision`, { method: 'POST', body: { decision, note } })
      setMessage(`Request ${requestId} ${decision}.`)
      reload()
    } catch (failure) {
      setActionError(failure.message)
    } finally {
      setBusy(0)
    }
  }

  if (loading || sourceRecords.loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  if (sourceRecords.error) return <ErrorMessage message={sourceRecords.error} />
  const sourceRecordById = new Map(sourceRecords.data.records.map((record) => [record.id, record]))
  const canReview = user.role === 'reviewer' || user.role === 'admin'
  return (
    <>
      <h1>Verification review queue</h1>
      <ErrorMessage message={actionError} />
      <p role="status">{message}</p>
      {data.requests.length ? <div className="admin-grid">{data.requests.map((request) => {
        const ownRequest = request.requested_by === user.id
        const evidence = request.record.type === 'requirement'
          ? firstJobEvidenceById.get(Number(request.record.id))
          : null
        const sourceReview = request.record.type === 'requirementSource' ? request.record : null
        const affectedRequirements = sourceReview
          ? firstJobEvidence.requirements.filter((entry) => entry.sourceIds.includes(sourceReview.id))
          : []
        return <article className="admin-card" key={request.id}>
          <h2>{request.record.title ?? request.record.label} ({request.record_type})</h2>
          <p>Submitted by {request.requested_by_name} on {request.created_at}</p>
          <p>Source: <a href={request.source_url} target="_blank" rel="noopener noreferrer">{request.source_url}</a></p>
          <p>Source accessed: {request.source_accessed_on}</p>
          <p>Comparison note: {request.note}</p>
          <label htmlFor={`review-note-${request.id}`}>Reviewer decision note
            <textarea
              id={`review-note-${request.id}`}
              minLength="10"
              maxLength="2000"
              required
              value={reviewNotes[request.id] ?? ''}
              disabled={!canReview || ownRequest || busy === request.id}
              onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value }))}
              aria-describedby={`review-note-help-${request.id}`}
            />
          </label>
          <p id={`review-note-help-${request.id}`}>Explain what you checked and why the evidence supports approval or requires rejection.</p>
          {evidence && <section aria-labelledby={`evidence-title-${request.id}`}>
            <h3 id={`evidence-title-${request.id}`}>First Job evidence package</h3>
            <p>Research status: {evidence.researchStatus}. Evidence completeness: {evidence.evidenceCompleteness}. Release disposition: {evidence.releaseDisposition}. Approval status: {evidence.independentApprovalStatus}.</p>
            <p><strong>Original catalog claim:</strong> {evidence.originalPublicClaim}</p>
            <p><strong>Proposed public wording:</strong> {evidence.proposedPublicInstruction}</p>
            <h4>Claim evidence</h4>
            <ol>{evidence.claims.map((claim, index) => <li key={`${request.id}-claim-${index}`}>
              <p>{claim.claim}</p>
              <blockquote>{claim.supportingPassage}</blockquote>
              <p>Accessed {claim.accessedOn}. {claim.conditionsAndExceptions}</p>
              <p>Evidence status: {claim.researchStatus}</p>
              <ul>{claim.sourceIds.map((sourceId) => {
                const source = sourceRecordById.get(sourceId)
                return <li key={sourceId}>
                  {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title} ({source.agency})
                  </a> : `Missing source: ${sourceId}`}
                  {source && <> · source record status: {source.verification}</>}
                  {source && <> · checked {source.lastChecked ?? 'date not recorded'} · {source.limitations}</>}
                  {source?.relatedSources?.map((url) => <span key={url}> · <a href={url} target="_blank" rel="noopener noreferrer">Additional research source</a></span>)}
                </li>
              })}</ul>
            </li>)}</ol>
            {evidence.conflictsOrOutdatedInformation.length > 0 && <>
              <h4>Conflicts and outdated details</h4>
              <ul>{evidence.conflictsOrOutdatedInformation.map((item) => <li key={item}>{item}</li>)}</ul>
            </>}
            {evidence.reviewerQuestions.length > 0 && <>
              <h4>Questions for the reviewer</h4>
              <ul>{evidence.reviewerQuestions.map((item) => <li key={item}>{item}</li>)}</ul>
            </>}
          </section>}
          {sourceReview && <section aria-labelledby={`source-evidence-title-${request.id}`}>
            <h3 id={`source-evidence-title-${request.id}`}>Source record evidence</h3>
            <p>Agency: {sourceReview.agency}. Evidence type: {sourceReview.evidenceType}.</p>
            <p>Source URL: <a href={sourceReview.url} target="_blank" rel="noopener noreferrer">{sourceReview.url}</a></p>
            <p>Source record status: {sourceReview.verification}.</p>
            <p>Source last checked: {sourceReview.lastChecked ?? 'Not recorded'}</p>
            <h4>Claims this source is recorded as supporting</h4>
            <ul>{(sourceReview.supports ?? []).map((claim) => <li key={claim}>{claim}</li>)}</ul>
            <p><strong>Limitations:</strong> {sourceReview.limitations}</p>
            {sourceReview.relatedSources?.length > 0 && <>
              <h4>Related research sources</h4>
              <ul>{sourceReview.relatedSources.map((url) => <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </li>)}</ul>
            </>}
            {affectedRequirements.length > 0 && <>
              <h4>First Job requirement claims using this source</h4>
              <ul>{affectedRequirements.map((entry) => <li key={entry.requirementId}>
                <p><strong>{entry.title}.</strong> {entry.originalPublicClaim}</p>
                <p>Proposed wording: {entry.proposedPublicInstruction}</p>
                <ul>{entry.claims.filter((claim) => claim.sourceIds.includes(sourceReview.id)).map((claim, index) => <li key={`${entry.requirementId}-claim-${index}`}>
                  <p>{claim.claim}</p>
                  <blockquote>{claim.supportingPassage}</blockquote>
                  <p>Accessed {claim.accessedOn}. {claim.conditionsAndExceptions}</p>
                  <p>Evidence status: {claim.researchStatus}</p>
                </li>)}</ul>
                <ul>{entry.reviewerQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
              </li>)}</ul>
            </>}
          </section>}
          <p>Current state: {request.record.verification}</p>
          {ownRequest && <p className="admin-notice">You submitted this request. Two-person review requires another reviewer, so both decision buttons are disabled.</p>}
          {!canReview && <p className="admin-notice">Viewer access is read-only.</p>}
          <button type="button" disabled={!canReview || ownRequest || busy === request.id || (reviewNotes[request.id]?.trim().length ?? 0) < 10} onClick={() => decide(request.id, 'approved')}>Approve</button>{' '}
          <button type="button" disabled={!canReview || ownRequest || busy === request.id || (reviewNotes[request.id]?.trim().length ?? 0) < 10} onClick={() => decide(request.id, 'rejected')}>Reject</button>
        </article>
      })}</div> : <EmptyMessage>No requests are waiting for review.</EmptyMessage>}
    </>
  )
}

export function AdminUsers() {
  const { data, error, loading, reload } = useResource('/admin/users?limit=100')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [actionError, setActionError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [rowBusy, setRowBusy] = useState(0)

  async function createUser(event) {
    event.preventDefault()
    setBusy(true)
    setActionError('')
    setMessage('')
    try {
      await adminRequest('/admin/users', { method: 'POST', body: { username: username.trim(), password, role } })
      setMessage(`Created ${role} account ${username.trim()}.`)
      setUsername('')
      setRole('viewer')
      reload()
    } catch (failure) {
      setActionError(failure.message)
    } finally {
      setPassword('')
      setBusy(false)
    }
  }

  async function updateUser(user, patch) {
    setRowBusy(user.id)
    setActionError('')
    setMessage('')
    try {
      await adminRequest(`/admin/users/${user.id}`, { method: 'PATCH', body: patch })
      setMessage(`Updated account ${user.username}.`)
      reload()
    } catch (failure) {
      setActionError(failure.message)
    } finally {
      setRowBusy(0)
    }
  }

  return (
    <>
      <h1>User administration</h1>
      <ErrorMessage message={error || actionError} />
      <p role="status">{message}</p>
      <form className="admin-card admin-form" onSubmit={createUser}>
        <h2>Create user</h2>
        <label htmlFor="new-user-name">Username<input id="new-user-name" autoComplete="off" required minLength="3" maxLength="50" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
        <label htmlFor="new-user-password">Temporary password (minimum 12 characters)<input id="new-user-password" type="password" autoComplete="new-password" required minLength="12" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        <label htmlFor="new-user-role">Role<select id="new-user-role" value={role} onChange={(event) => setRole(event.target.value)}><option value="viewer">Viewer</option><option value="reviewer">Reviewer</option><option value="admin">Admin</option></select></label>
        <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      {loading ? <Loading /> : data ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Username</th><th>Role</th><th>State</th><th>Actions</th></tr></thead><tbody>
        {data.users.map((user) => <tr key={user.id}><td>{user.username}</td><td><select aria-label={`Role for ${user.username}`} value={user.role} disabled={rowBusy === user.id} onChange={(event) => updateUser(user, { role: event.target.value })}><option value="viewer">Viewer</option><option value="reviewer">Reviewer</option><option value="admin">Admin</option></select></td><td>{user.disabled ? 'Disabled' : 'Active'}</td><td><button type="button" disabled={rowBusy === user.id} onClick={() => updateUser(user, { disabled: !user.disabled })}>{user.disabled ? 'Enable' : 'Disable'}</button></td></tr>)}
      </tbody></table></div> : null}
    </>
  )
}

export function AdminAudit() {
  const [page, setPage] = useState(1)
  const path = useMemo(() => `/admin/audit?page=${page}&limit=50`, [page])
  const { data, error, loading } = useResource(path)
  if (loading) return <Loading />
  if (error) return <ErrorMessage message={error} />
  return (
    <>
      <h1>Audit log (read-only)</h1>
      {data.entries.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Record</th><th>Previous</th><th>Next</th><th>Note</th></tr></thead><tbody>
        {data.entries.map((entry) => <tr key={entry.id}><td>{entry.at}</td><td>{entry.actor}</td><td>{entry.action}</td><td>{entry.record_type ? `${entry.record_type} ${entry.record_id}` : '—'}</td><td><pre>{entry.previous ? JSON.stringify(entry.previous, null, 2) : '—'}</pre></td><td><pre>{entry.next ? JSON.stringify(entry.next, null, 2) : '—'}</pre></td><td>{entry.note}</td></tr>)}
      </tbody></table></div> : <EmptyMessage>No audit entries yet.</EmptyMessage>}
      <div className="admin-pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous page</button><button type="button" disabled={page * data.limit >= data.total} onClick={() => setPage((current) => current + 1)}>Next page</button></div>
    </>
  )
}
