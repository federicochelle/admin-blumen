export const PLANT_EVENT_TYPES = [
  { value: 'GERMINACION', label: 'Germinación', tone: 'green' },
  { value: 'PRIMER_TRASPLANTE', label: 'Primer trasplante', tone: 'green' },
  { value: 'SEGUNDO_TRASPLANTE', label: 'Segundo trasplante', tone: 'green' },
  { value: 'FLORACION', label: 'Floración', tone: 'violet' },
  { value: 'SECADO', label: 'Secado', tone: 'orange' },
  { value: 'CAMBIO_UBICACION', label: 'Cambio de ubicación', tone: 'blue' },
  { value: 'CONTROL_SANITARIO', label: 'Control sanitario', tone: 'blue' },
  { value: 'TRATAMIENTO', label: 'Tratamiento', tone: 'red' },
  { value: 'FERTILIZACION', label: 'Fertilización', tone: 'blue' },
  { value: 'DRENADO', label: 'Drenado', tone: 'blue' },
  { value: 'PODA', label: 'Poda', tone: 'green' },
  { value: 'OBSERVACION', label: 'Observación', tone: 'yellow' },
  { value: 'DESCARTE', label: 'Descarte', tone: 'red' },
]

const LEGACY_PLANT_EVENT_TYPES = [
  { value: 'CREACION', label: 'Creación', tone: 'green' },
  { value: 'CAMBIO_ETAPA', label: 'Cambio de etapa', tone: 'violet' },
  { value: 'TRASPLANTE', label: 'Trasplante', tone: 'green' },
]

export const MANUAL_PLANT_EVENT_TYPES = PLANT_EVENT_TYPES.filter(
  (eventType) => eventType.value !== 'CAMBIO_UBICACION',
)

export const PLANT_EVENT_MILESTONES = [
  {
    key: 'GERMINACION',
    label: 'Germinación',
    aliases: ['GERMINACION', 'germinacion'],
  },
  {
    key: 'PRIMER_TRASPLANTE',
    label: 'Primer trasplante',
    aliases: ['PRIMER_TRASPLANTE', 'primer_trasplante', 'primer_transplante', 'TRASPLANTE', 'trasplante'],
  },
  {
    key: 'SEGUNDO_TRASPLANTE',
    label: 'Segundo trasplante',
    aliases: ['SEGUNDO_TRASPLANTE', 'segundo_trasplante', 'segundo_transplante'],
  },
  {
    key: 'FLORACION',
    label: 'Floración',
    aliases: ['FLORACION', 'floracion', 'CAMBIO_ETAPA', 'cambio_etapa', 'inicio_floracion'],
  },
  {
    key: 'SECADO',
    label: 'Secado',
    aliases: ['SECADO', 'secado', 'COSECHA', 'cosecha'],
  },
]

const EVENT_TYPE_BY_VALUE = [...PLANT_EVENT_TYPES, ...LEGACY_PLANT_EVENT_TYPES].reduce((accumulator, item) => {
  accumulator[item.value] = item
  return accumulator
}, {})

const LEGACY_EVENT_ALIASES = {
  creacion: { label: 'Creación', tone: 'green' },
  alta: { label: 'Creación', tone: 'green' },
  germinacion: { label: 'Germinación', tone: 'green' },
  enraizado: { label: 'Enraizado', tone: 'green' },
  trasplante: { label: 'Trasplante', tone: 'green' },
  primer_trasplante: { label: 'Primer trasplante', tone: 'green' },
  primer_transplante: { label: 'Primer trasplante', tone: 'green' },
  segundo_trasplante: { label: 'Segundo trasplante', tone: 'green' },
  segundo_transplante: { label: 'Segundo trasplante', tone: 'green' },
  cambio_etapa: { label: 'Cambio de etapa', tone: 'violet' },
  floracion: { label: 'Floración', tone: 'violet' },
  inicio_floracion: { label: 'Floración', tone: 'violet' },
  control_sanitario: { label: 'Control sanitario', tone: 'blue' },
  tratamiento: { label: 'Tratamiento', tone: 'red' },
  fertilizacion: { label: 'Fertilización', tone: 'blue' },
  riego: { label: 'Fertilización', tone: 'blue' },
  drenado: { label: 'Drenado', tone: 'blue' },
  poda: { label: 'Poda', tone: 'green' },
  cambio_ubicacion: { label: 'Cambio de ubicación', tone: 'blue' },
  cambio_zona: { label: 'Cambio de ubicación', tone: 'blue' },
  observacion: { label: 'Observación', tone: 'yellow' },
  secado: { label: 'Secado', tone: 'orange' },
  cosecha: { label: 'Secado', tone: 'orange' },
  descarte: { label: 'Descarte', tone: 'red' },
}

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

function normalizeLookupKey(value) {
  if (!value) {
    return ''
  }

  return String(value).trim()
}

function normalizeEventTypeAlias(value) {
  return normalizeLookupKey(value).toLowerCase()
}

function resolvePlantEventType(value) {
  const normalized = normalizeLookupKey(value)

  if (!normalized) {
    return null
  }

  if (EVENT_TYPE_BY_VALUE[normalized]) {
    return EVENT_TYPE_BY_VALUE[normalized]
  }

  const lowerKey = normalized.toLowerCase()

  if (LEGACY_EVENT_ALIASES[lowerKey]) {
    return LEGACY_EVENT_ALIASES[lowerKey]
  }

  return null
}

export function getPlantEventTypeLabel(value) {
  const resolved = resolvePlantEventType(value)
  return resolved?.label ?? toReadableText(value)
}

export function getPlantEventTypeTone(value) {
  const resolved = resolvePlantEventType(value)
  return resolved?.tone ?? 'neutral'
}

export function isPlantCreationEventType(value) {
  return ['creacion', 'alta'].includes(normalizeEventTypeAlias(value))
}

export function isPlantDryingEventType(value) {
  return ['secado', 'cosecha'].includes(normalizeEventTypeAlias(value))
}

export function isBatchHarvestEvent(event) {
  const normalizedType = normalizeEventTypeAlias(event?.event_type ?? event?.type)
  const eventData = event?.event_data ?? event?.eventData ?? null
  return normalizedType === 'cosecha' && eventData?.source === 'batch'
}

export function isPlantTransplantEventType(value) {
  const normalized = normalizeEventTypeAlias(value)

  return (
    [
    'trasplante',
    'primer_trasplante',
    'primer_transplante',
    'segundo_trasplante',
    'segundo_transplante',
    ].includes(normalized) ||
    normalized.includes('traspl') ||
    normalized.includes('transpl')
  )
}

export function matchesPlantEventMilestone(value, milestoneKey) {
  const milestone = PLANT_EVENT_MILESTONES.find((item) => item.key === milestoneKey)

  if (!milestone) {
    return false
  }

  const normalized = normalizeLookupKey(value)
  return milestone.aliases.includes(normalized)
}
