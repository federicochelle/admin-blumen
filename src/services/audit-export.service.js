import { buildTraceabilityModel } from './traceability.adapters'
import {
  getAllIrrigations,
  getAllPlantEvents,
  getBedsByRoom,
  getPlants,
  getRooms,
} from './traceability.service'

const TEMPLATE_URL = '/templates/Trazabilidad Inchala.xlsx'
const LEGACY_TRANSPLANT_TYPES = ['TRASPLANTE']
const LEGACY_FLOWERING_TYPES = ['CAMBIO_ETAPA']

function normalizeCohortKey(value) {
  if (!value) {
    return null
  }

  const normalized = String(value).toUpperCase().replace(/\s+/g, '')
  const match = normalized.match(/(20\d{2})[.\-_/]*(?:C|CO)?0?(\d{1,2})/)

  if (!match) {
    return null
  }

  return `${match[1]}.C${match[2].padStart(2, '0')}`
}

function getPlantCohortKey(code) {
  return normalizeCohortKey(code)
}

function getSheetCohortKey(sheetName) {
  return normalizeCohortKey(sheetName)
}

function formatAuditDate(value) {
  if (!value) {
    return ''
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

function normalizeEventType(value) {
  return String(value ?? '').trim().toUpperCase()
}

function sortEventsByDate(events = []) {
  return [...events].sort((left, right) => {
    const leftValue = left?.event_date ?? left?.date ?? null
    const rightValue = right?.event_date ?? right?.date ?? null

    if (!leftValue && !rightValue) {
      return 0
    }

    if (!leftValue) {
      return 1
    }

    if (!rightValue) {
      return -1
    }

    return new Date(leftValue) - new Date(rightValue)
  })
}

function findFirstEvent(events, types) {
  return findNthEvent(events, types, 0)
}

function findNthEvent(events, types, index) {
  const normalizedTypes = types.map((type) => normalizeEventType(type))
  const matches = sortEventsByDate(events).filter((event) =>
    normalizedTypes.includes(normalizeEventType(event?.event_type)),
  )

  return matches[index] ?? null
}

function getHarvestWeight(harvestEvent) {
  const eventData = harvestEvent?.event_data ?? harvestEvent?.eventData ?? null

  if (!eventData || typeof eventData !== 'object') {
    return ''
  }

  const weight = eventData.harvest_weight ?? eventData.weight ?? ''
  return weight === null || weight === undefined || weight === '' ? '' : String(weight)
}

function getAuditObservations(plant, events) {
  const notes = []
  const sortedEvents = sortEventsByDate(events)

  sortedEvents.forEach((event) => {
    const eventType = normalizeEventType(event?.event_type)
    const description = String(event?.description ?? '').trim()

    if (!description) {
      return
    }

    if (eventType === 'OBSERVACION' || eventType === 'COSECHA') {
      notes.push(description)
    }
  })

  if (notes.length > 0) {
    return notes.join('\n')
  }

  return plant.notes ?? ''
}

function getEventDateValue(event) {
  return formatAuditDate(event?.event_date ?? event?.date ?? '')
}

function buildRowMap(plant) {
  const sortedEvents = sortEventsByDate(plant.events)
  const germinationEvent = findFirstEvent(sortedEvents, ['GERMINACION'])
  const firstTransplantEvent =
    findFirstEvent(sortedEvents, ['PRIMER_TRASPLANTE']) ??
    findFirstEvent(sortedEvents, LEGACY_TRANSPLANT_TYPES)
  const secondTransplantEvent =
    findFirstEvent(sortedEvents, ['SEGUNDO_TRASPLANTE']) ??
    findNthEvent(sortedEvents, LEGACY_TRANSPLANT_TYPES, 1)
  const floweringEvent =
    findFirstEvent(sortedEvents, ['FLORACION']) ??
    findFirstEvent(sortedEvents, LEGACY_FLOWERING_TYPES)
  const harvestEvent = findFirstEvent(sortedEvents, ['COSECHA'])

  return {
    Individuo: plant.code ?? '',
    ' ': plant.code ?? '',
    'Inicio de germinacion': getEventDateValue(germinationEvent) || plant.plantedAt || '',
    '1er trasplante': getEventDateValue(firstTransplantEvent) || plant.firstTransplantAt || '',
    '2do trasplante': getEventDateValue(secondTransplantEvent),
    'Inicio de floracion': getEventDateValue(floweringEvent),
    Cosecha: getEventDateValue(harvestEvent),
    Peso: getHarvestWeight(harvestEvent),
    Observaciones: getAuditObservations(plant, sortedEvents),
  }
}

function buildSheetRows(header, plants) {
  return plants.map((plant) => {
    const rowMap = buildRowMap(plant)
    return header.map((column) => rowMap[column] ?? '')
  })
}

async function loadTraceabilityPlants() {
  const [rooms, plants, plantEvents, irrigations] = await Promise.all([
    getRooms(),
    getPlants(),
    getAllPlantEvents(),
    getAllIrrigations(),
  ])

  const bedsByRoom = await Promise.all(rooms.map((room) => getBedsByRoom(room.id)))
  const beds = bedsByRoom.flat()

  return buildTraceabilityModel({
    rooms,
    beds,
    plants,
    plantEvents,
    irrigations,
  }).plantRows
}

export async function exportTraceabilityAuditWorkbook() {
  const [{ read, utils, writeFile }, templateResponse, plants] = await Promise.all([
    import('xlsx'),
    fetch(TEMPLATE_URL),
    loadTraceabilityPlants(),
  ])

  if (!templateResponse.ok) {
    throw new Error('No se pudo cargar la plantilla de auditoria.')
  }

  const templateBuffer = await templateResponse.arrayBuffer()
  const workbook = read(templateBuffer, { type: 'array' })
  const plantsByCohortKey = plants.reduce((accumulator, plant) => {
    const key = getPlantCohortKey(plant.code)

    if (!key) {
      return accumulator
    }

    if (!accumulator[key]) {
      accumulator[key] = []
    }

    accumulator[key].push(plant)
    return accumulator
  }, {})

  workbook.SheetNames.forEach((sheetName) => {
    const templateSheet = workbook.Sheets[sheetName]
    const header = (utils.sheet_to_json(templateSheet, {
      header: 1,
      range: 0,
      blankrows: false,
    })[0] ?? [])
      .map((value) => value ?? '')

    const cohortKey = getSheetCohortKey(sheetName)
    const sheetPlants = cohortKey ? [...(plantsByCohortKey[cohortKey] ?? [])] : []
    sheetPlants.sort((left, right) => String(left.code ?? '').localeCompare(String(right.code ?? '')))
    const nextSheet = utils.aoa_to_sheet([header, ...buildSheetRows(header, sheetPlants)])

    if (templateSheet['!cols']) {
      nextSheet['!cols'] = templateSheet['!cols']
    }

    if (templateSheet['!rows']) {
      nextSheet['!rows'] = templateSheet['!rows']
    }

    workbook.Sheets[sheetName] = nextSheet
  })

  const dateLabel = new Date().toISOString().slice(0, 10)
  writeFile(workbook, `blumen-auditoria-trazabilidad-${dateLabel}.xlsx`)
}
