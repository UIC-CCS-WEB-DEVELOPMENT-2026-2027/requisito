function RecordMeta({ record }) {
  const stateLabel = {
    verified: 'Verified',
    unverified: 'Not yet verified',
    conflicting: 'Conflicting information',
  }[record.verification] ?? 'Not yet verified'

  return (
    <div className="record-meta">
      <span className={`status-badge verification-${record.verification ?? 'unverified'}`}>
        {stateLabel}
      </span>
      <p>
        Last verified:{' '}
        {record.verification === 'verified' && record.lastVerified
          ? <time dateTime={record.lastVerified}>{record.lastVerified}</time>
          : 'Never verified'}
      </p>
      {record.sourceUrl ? (
        <p><a href={record.sourceUrl} target="_blank" rel="noopener noreferrer">Official source</a></p>
      ) : (
        <p>Source link not provided.</p>
      )}
      {record.relatedSources?.map((source, index) => (
        <p key={source}><a href={source} target="_blank" rel="noopener noreferrer">Additional source {index + 1}</a></p>
      ))}
    </div>
  )
}

export default RecordMeta
