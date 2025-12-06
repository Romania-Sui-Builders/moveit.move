// utils/format.ts
export function truncateAddress(address: string, length: number = 4): string {
  if (!address || address.length <= length * 2 + 2) {
    return address
  }
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 minute
  if (diff < 60000) {
    return 'just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  // More than 1 day - use formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function calculateEffortPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function formatEffort(effort: number): string {
  if (effort === 0) return 'No effort set'
  if (effort === 1) return '1 hour'
  return `${effort} hours`
}

export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('done') || statusLower.includes('complete')) {
    return '#10b981' // green
  }
  if (statusLower.includes('progress') || statusLower.includes('doing')) {
    return '#3b82f6' // blue
  }
  if (statusLower.includes('review')) {
    return '#f59e0b' // orange
  }
  return '#6b7280' // gray (default)
}
