export const BATCH_STATUS_OPTIONS = ['ACTIVE', 'HARVESTED', 'CLOSED', 'CANCELLED']

export function formatDateInputFromValue(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

export function toLocalNoonIso(dateValue) {
  if (!dateValue) {
    return null
  }

  const parsedDate = new Date(`${dateValue}T12:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toISOString()
}

export function formatBatchDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
