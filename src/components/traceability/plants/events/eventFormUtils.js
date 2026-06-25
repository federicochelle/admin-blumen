import { getPlantEventTypeLabel } from '../../../../constants/plantEventTypes'
import { getPlantStageLabel } from '../../../../constants/plantStages'

export const EVENT_FORM_INITIAL_VALUES = {
  event_date: '',
  description: '',
  observation: '',
  product: '',
  dose: '',
  ph: '',
  ec: '',
  liters: '',
  ph_out: '',
  ec_out: '',
}

export function getCurrentDateTimeLocal() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function createInitialEventFormValues() {
  return {
    ...EVENT_FORM_INITIAL_VALUES,
    event_date: getCurrentDateTimeLocal(),
  }
}

export function getEventFormKind(eventType) {
  if (eventType === 'FLORACION') {
    return 'flowering'
  }

  if (eventType === 'FERTILIZACION') {
    return 'fertilization'
  }

  if (eventType === 'DRENADO') {
    return 'drain'
  }

  return 'generic'
}

function toIsoDateTime(value) {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate.toISOString()
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function buildSentence(base, observation) {
  const normalizedBase = String(base ?? '').trim().replace(/[.\s]+$/, '')
  const normalizedObservation = String(observation ?? '').trim()

  if (!normalizedObservation) {
    return normalizedBase ? `${normalizedBase}.` : null
  }

  return `${normalizedBase}. ${normalizedObservation}`
}

function buildFertilizationDescription(values) {
  const segments = []

  if (values.product?.trim()) {
    segments.push(values.product.trim())
  }

  if (values.dose?.trim()) {
    segments.push(values.dose.trim())
  }

  if (values.ph !== '') {
    segments.push(`pH ${values.ph}`)
  }

  if (values.ec !== '') {
    segments.push(`EC ${values.ec}`)
  }

  if (values.liters !== '') {
    segments.push(`${values.liters}L`)
  }

  const base = segments.length > 0 ? `Fertilizacion: ${segments.join(' · ')}` : 'Fertilizacion'
  return buildSentence(base, values.observation)
}

function buildDrainDescription(values) {
  const segments = []

  if (values.ph_out !== '') {
    segments.push(`pH salida ${values.ph_out}`)
  }

  if (values.ec_out !== '') {
    segments.push(`EC salida ${values.ec_out}`)
  }

  const base = segments.length > 0 ? `Drenado: ${segments.join(' · ')}` : 'Drenado'
  return buildSentence(base, values.observation)
}

export function getStageUpdateForEventType(eventType) {
  if (eventType === 'FLORACION') {
    return 'FLORACION'
  }

  if (eventType === 'COSECHA') {
    return 'COSECHADA'
  }

  if (eventType === 'DESCARTE') {
    return 'DESCARTADA'
  }

  return null
}

export function validateEventForm(eventType, values) {
  if (!eventType?.trim()) {
    return 'Selecciona un tipo de evento.'
  }

  if (!values.event_date) {
    return 'Completa la fecha del evento.'
  }

  const eventDate = toIsoDateTime(values.event_date)

  if (!eventDate) {
    return 'La fecha del evento no es valida.'
  }

  if (eventType === 'FERTILIZACION' && !values.product.trim()) {
    return 'El producto es obligatorio.'
  }

  if (eventType === 'DRENADO' && values.ph_out === '' && values.ec_out === '') {
    return 'Completa al menos pH salida o EC salida.'
  }

  return ''
}

export function buildPlantEventPayload(eventType, values) {
  const eventDate = toIsoDateTime(values.event_date)

  if (!eventDate) {
    throw new Error('La fecha del evento no es valida.')
  }

  if (eventType === 'FLORACION') {
    return {
      event_date: eventDate,
      description: buildSentence(`Inicio de ${getPlantStageLabel('FLORACION')}`, values.observation),
      event_data: {
        new_stage: 'FLORACION',
      },
    }
  }

  if (eventType === 'FERTILIZACION') {
    return {
      event_date: eventDate,
      description: buildFertilizationDescription(values),
      event_data: {
        product: values.product.trim(),
        dose: values.dose.trim() || null,
        ph: toNullableNumber(values.ph),
        ec: toNullableNumber(values.ec),
        liters: toNullableNumber(values.liters),
      },
    }
  }

  if (eventType === 'DRENADO') {
    return {
      event_date: eventDate,
      description: buildDrainDescription(values),
      event_data: {
        ph_out: toNullableNumber(values.ph_out),
        ec_out: toNullableNumber(values.ec_out),
      },
    }
  }

  return {
    event_date: eventDate,
    description: values.description.trim() || getPlantEventTypeLabel(eventType),
    event_data: null,
  }
}
