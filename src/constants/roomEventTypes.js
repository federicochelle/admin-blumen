export const ROOM_EVENT_TYPES = [
  { value: 'LIMPIEZA', label: 'Limpieza', tone: 'blue' },
  { value: 'DESINFECCION', label: 'Desinfección', tone: 'violet' },
  { value: 'CONTROL_AMBIENTAL', label: 'Control ambiental', tone: 'green' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', tone: 'yellow' },
  { value: 'CAMBIO_LUCES', label: 'Cambio de luces', tone: 'orange' },
  { value: 'CONTROL_PLAGAS', label: 'Control de plagas', tone: 'red' },
  { value: 'OBSERVACION_SALA', label: 'Observación de sala', tone: 'blue' },
]

const ROOM_EVENT_TYPE_BY_VALUE = ROOM_EVENT_TYPES.reduce((accumulator, item) => {
  accumulator[item.value] = item
  return accumulator
}, {})

function toReadableText(value) {
  if (!value) {
    return 'Evento'
  }

  return String(value)
    .trim()
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getRoomEventTypeLabel(value) {
  if (!value) {
    return 'Evento'
  }

  return ROOM_EVENT_TYPE_BY_VALUE[String(value).trim()]?.label ?? toReadableText(value)
}

export function getRoomEventTypeTone(value) {
  if (!value) {
    return 'neutral'
  }

  return ROOM_EVENT_TYPE_BY_VALUE[String(value).trim()]?.tone ?? 'neutral'
}
