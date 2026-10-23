export function getRecordCounts(collections) {
  const counts = Object.fromEntries(Object.entries(collections).map(([name, records]) => [
    name,
    Array.isArray(records) ? records.length : 0,
  ]))
  return { collections: counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) }
}
