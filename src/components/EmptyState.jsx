function EmptyState({ message = 'No records found' }) {
  return (
    <div className="empty-state" role="status">
      <p>{message}</p>
    </div>
  )
}

export default EmptyState
