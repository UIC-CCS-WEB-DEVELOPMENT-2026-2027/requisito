import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { getBarangays, getCityFacts, getOfficials, getRequirementsByGoal, getServices, getUpdates, getGoals } from '../data/helpers.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const repoIssueUrl = 'https://github.com/UIC-CCS-WEB-DEVELOPMENT-2026-2027/requisito/issues/new'
const groupTranslationKeys = {
  Services: 'group.services',
  Barangays: 'group.barangays',
  Requirements: 'group.requirements',
  Officials: 'group.officials',
  'City facts': 'group.cityFacts',
  Updates: 'group.cityUpdates',
}

function collectRecords() {
  return {
    Services: getServices().map((record) => ({ ...record, optionType: 'service' })),
    Barangays: getBarangays().filter((record) => !record.isSample).map((record) => ({ ...record, optionType: 'barangay' })),
    Requirements: getGoals().flatMap((goal) => getRequirementsByGoal(goal.id))
      .map((record) => ({ ...record, optionType: 'requirement' })),
    Officials: getOfficials().map((record) => ({ ...record, optionType: 'official' })),
    'City facts': getCityFacts().map((record) => ({ ...record, optionType: 'fact' })),
    Updates: getUpdates().map((record) => ({ ...record, optionType: 'update' })),
  }
}

function Contribute() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [recordId, setRecordId] = useState('')
  const [message, setMessage] = useState('')
  const [suggestedUrl, setSuggestedUrl] = useState('')
  const [feedback, setFeedback] = useState('')
  const [issueUrl, setIssueUrl] = useState('')
  const groupedRecords = useMemo(() => collectRecords(), [])
  const records = Object.values(groupedRecords).flat()
  const relatedRecord = records.find((record) => record.slug === searchParams.get('record'))
  const selectedRecord = records.find((record) => `${record.optionType}:${record.id}` === recordId)

  function handleSubmit(event) {
    event.preventDefault()
    const cleanMessage = message.trim()
    const cleanSource = suggestedUrl.trim()
    if (!recordId) {
      setFeedback(t('form.chooseRecord'))
      setIssueUrl('')
      return
    }
    if (!cleanMessage) {
      setFeedback(t('form.enterCorrection'))
      setIssueUrl('')
      return
    }
    if (cleanSource) {
      let parsedSource
      try { parsedSource = new URL(cleanSource) } catch { parsedSource = null }
      if (!cleanSource.startsWith('https://') || parsedSource?.protocol !== 'https:' || !parsedSource.hostname) {
        setFeedback(t('form.https'))
        setIssueUrl('')
        return
      }
    }
    const title = `Data correction: ${selectedRecord.title ?? selectedRecord.label}`
    const body = [
      '## Suggested correction',
      `Record: ${selectedRecord.title ?? selectedRecord.label} (${selectedRecord.optionType})`,
      '',
      cleanMessage,
      cleanSource ? `Suggested source: ${cleanSource}` : '',
      '',
      'This public issue was prepared by the Requisito contribution form. Do not include personal information.',
    ].filter(Boolean).join('\n')
    setIssueUrl(`${repoIssueUrl}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`)
    setFeedback(t('form.issueReady'))
  }

  return (
    <section className="page-content flow-content" aria-labelledby="contribute-title">
      <p className="eyebrow">{t('contribute.eyebrow')}</p>
      <h1 id="contribute-title">{t('page.contribute')}</h1>
      <p className="page-description">{t('contribute.description')}</p>
      {relatedRecord && (
        <p className="sample-notice">
          {t('contribute.related').replace('{record}', relatedRecord.title ?? relatedRecord.label)}
        </p>
      )}
      <form className="portal-form" onSubmit={handleSubmit}>
        <label htmlFor="contribute-record">{t('label.chooseRecord')}</label>
        <select id="contribute-record" value={recordId} onChange={(event) => setRecordId(event.target.value)}>
          <option value="">{t('contribute.chooseRecord')}</option>
          {Object.entries(groupedRecords).map(([group, items]) => items.length > 0 && (
            <optgroup label={t(groupTranslationKeys[group])} key={group}>
              {items.map((record) => (
                <option key={`${record.optionType}:${record.id}`} value={`${record.optionType}:${record.id}`}>
                  {record.title ?? record.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <label htmlFor="contribute-message">{t('label.correction')}</label>
        <textarea id="contribute-message" value={message} maxLength={1000} onChange={(event) => setMessage(event.target.value)} />
        <label htmlFor="contribute-source">{t('label.suggestedSource')}</label>
        <input id="contribute-source" type="url" value={suggestedUrl} onChange={(event) => setSuggestedUrl(event.target.value)} placeholder="https://" />
        <p className="form-privacy-note">{t('contribute.privacy')}</p>
        <button type="submit">{t('button.contribute')}</button>
      </form>
      <p className="form-feedback" role="status" aria-live="polite">{feedback}</p>
      {issueUrl && <p><a className="return-link" href={issueUrl} target="_blank" rel="noopener noreferrer">{t('contribute.continueGithub')}</a></p>}
      {records.length === 0 && <EmptyState message={t('contribute.empty')} />}
      <p><Link to="/status">{t('contribute.reviewStatus')}</Link></p>
    </section>
  )
}

export default Contribute
