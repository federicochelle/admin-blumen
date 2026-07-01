import { getPlantEventTypeLabel } from '../constants/plantEventTypes'
import { getRoomEventTypeLabel } from '../constants/roomEventTypes'
import { getPlantStageLabel } from '../constants/plantStages'

function formatDate(value) {
  if (!value) {
    return null
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

function formatDateTime(value) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalizeType(type) {
  if (!type) {
    return 'Sin tipo'
  }

  const value = String(type).trim()
  return value.length > 0 ? value : 'Sin tipo'
}

function groupBy(items, getKey) {
  return items.reduce((accumulator, item) => {
    const key = getKey(item)

    if (!key) {
      return accumulator
    }

    if (!accumulator[key]) {
      accumulator[key] = []
    }

    accumulator[key].push(item)
    return accumulator
  }, {})
}

function getLatestBy(items, field) {
  return items.reduce((latest, item) => {
    if (!item?.[field]) {
      return latest
    }

    if (!latest?.[field]) {
      return item
    }

    return new Date(item[field]) > new Date(latest[field]) ? item : latest
  }, null)
}

function getPlantLatestEvent(events = []) {
  return events[events.length - 1] ?? null
}

function sortByDateDesc(items, field) {
  return [...items].sort((left, right) => {
    const leftValue = left?.[field]
    const rightValue = right?.[field]

    if (!leftValue && !rightValue) {
      return 0
    }

    if (!leftValue) {
      return 1
    }

    if (!rightValue) {
      return -1
    }

    return new Date(rightValue) - new Date(leftValue)
  })
}

function getPositiveNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function isGerminationEvent(eventType) {
  const normalized = String(eventType ?? '').trim().toLowerCase()
  return normalized === 'germinacion'
}

function getFirstGerminationEvent(events = []) {
  return [...events]
    .filter((event) => isGerminationEvent(event?.event_type))
    .sort((left, right) => {
      const leftValue = left?.event_date ?? null
      const rightValue = right?.event_date ?? null

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
    })[0] ?? null
}

function getPlantAgeReferenceDate(events = [], plantedAt = null) {
  const germinationEvent = getFirstGerminationEvent(events)
  return germinationEvent?.event_date ?? plantedAt ?? null
}

function getPlantAgeInDays(events = [], plantedAt = null) {
  const referenceDate = getPlantAgeReferenceDate(events, plantedAt)

  if (!referenceDate) {
    return null
  }

  const parsedDate = new Date(referenceDate)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  const diffInMilliseconds = Date.now() - parsedDate.getTime()
  return diffInMilliseconds >= 0 ? Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) : null
}

function getPlantAgeLabel(events = [], plantedAt = null) {
  const ageInDays = getPlantAgeInDays(events, plantedAt)
  return ageInDays !== null ? `${ageInDays} días` : '—'
}

export function buildTraceabilityModel({
  rooms = [],
  beds = [],
  plants = [],
  plantEvents = [],
  roomEvents = [],
  irrigations = [],
}) {
  const bedsByRoomId = groupBy(beds, (bed) => bed.room_id)
  const plantsByRoomId = groupBy(plants, (plant) => plant.roomId)
  const plantsByBedId = groupBy(plants, (plant) => plant.bedId)
  const plantEventsByPlantId = groupBy(plantEvents, (event) => event.plant_id)
  const roomEventsByRoomId = groupBy(roomEvents, (event) => event.room_id)
  const irrigationsByBedId = groupBy(irrigations, (irrigation) => irrigation.bed_id)
  const plantsById = plants.reduce((accumulator, plant) => {
    accumulator[plant.id] = plant
    return accumulator
  }, {})
  const bedsById = beds.reduce((accumulator, bed) => {
    accumulator[bed.id] = bed
    return accumulator
  }, {})
  const roomsById = rooms.reduce((accumulator, room) => {
    accumulator[room.id] = room
    return accumulator
  }, {})

  const roomSummaries = rooms.map((room) => {
    const roomBeds = bedsByRoomId[room.id] ?? []
    const roomPlants = plantsByRoomId[room.id] ?? []
    const roomEventHistory = roomEventsByRoomId[room.id] ?? []
    const irrigationPool = roomBeds.flatMap((bed) => irrigationsByBedId[bed.id] ?? [])
    const latestIrrigation = getLatestBy(irrigationPool, 'irrigation_date')
    const occupiedBeds = roomBeds.filter((bed) => (plantsByBedId[bed.id] ?? []).length > 0).length
    const roomCapacity = roomBeds.reduce((total, bed) => total + (Number(bed.capacity) || 0), 0)
    const occupancy =
      roomCapacity > 0 ? Math.round((roomPlants.length / roomCapacity) * 100) : 0

    return {
      id: room.id,
      name: room.name ?? 'Sin nombre',
      type: normalizeType(room.type ?? room.room_type ?? null),
      status: room.status ?? null,
      notes: room.description ?? room.notes ?? room.observations ?? null,
      layout_width: room.layout_width ?? null,
      layout_height: room.layout_height ?? null,
      layout: {
        width: room.layout_width ?? null,
        height: room.layout_height ?? null,
      },
      bedCount: roomBeds.length,
      plantCount: roomPlants.length,
      totalBeds: roomBeds.length,
      totalPlants: roomPlants.length,
      capacity: roomCapacity,
      occupancyPercentage: occupancy,
      latestIrrigationLabel: formatDateTime(latestIrrigation?.irrigation_date),
      occupancy,
      lastIrrigation: formatDateTime(latestIrrigation?.irrigation_date),
      roomEvents: roomEventHistory.map((event) => ({
        id: event.id,
        room_id: event.room_id ?? null,
        event_type: event.event_type ?? null,
        description: event.description ?? event.notes ?? null,
        event_date: event.event_date ?? null,
        event_data: event.event_data ?? null,
        eventData: event.event_data ?? null,
        created_by: event.created_by ?? null,
        label:
          event.description ??
          event.notes ??
          getRoomEventTypeLabel(event.event_type),
        type: getRoomEventTypeLabel(event.event_type),
        date: formatDate(event.event_date) ?? 'Sin fecha',
      })),
      metrics: {
        activeBeds: occupiedBeds,
        emptyBeds: Math.max(roomBeds.length - occupiedBeds, 0),
        irrigationCount: irrigationPool.length,
      },
    }
  })

  const plantRows = plants.map((plant) => {
    const events = plantEventsByPlantId[plant.id] ?? []
    const latestEvent = getPlantLatestEvent(events)
    const bedIrrigations = irrigationsByBedId[plant.bedId] ?? []
    const latestIrrigation = getLatestBy(bedIrrigations, 'irrigation_date')
    const bed = plant.bedId ? bedsById[plant.bedId] : null
    const bedPlants = plant.bedId ? plantsByBedId[plant.bedId] ?? [] : []
    const capacity = getPositiveNumber(bed?.capacity)
    const rowCount = getPositiveNumber(bed?.row_count)
    const columnCount = getPositiveNumber(bed?.column_count)
    const gridCapacity = rowCount > 0 && columnCount > 0 ? rowCount * columnCount : 0
    const visualCapacity = gridCapacity > 0 ? gridCapacity : capacity
    const ageReferenceDate = getPlantAgeReferenceDate(events, plant.planted_at ?? null)
    const ageInDays = getPlantAgeInDays(events, plant.planted_at ?? null)

    return {
      id: plant.id,
      code: plant.code ?? 'Sin codigo',
      strain: plant.strain ?? 'Sin genetica',
      room: plant.room ?? 'Sin sala',
      roomId: plant.roomId ?? null,
      bed: plant.bed ?? 'Sin zona',
      bedId: plant.bedId ?? null,
      stageValue: plant.stage ?? null,
      stage: getPlantStageLabel(plant.stage),
      status: plant.status ?? 'Sin estado',
      rowIndex: Number.isInteger(plant.row_index) ? plant.row_index : null,
      columnIndex: Number.isInteger(plant.column_index) ? plant.column_index : null,
      strainId: plant.strainId ?? null,
      batchId: plant.batchId ?? null,
      batchCode: plant.batchCode ?? null,
      batchName: plant.batchName ?? null,
      batchLabel: plant.batchCode
        ? plant.batchName
          ? `${plant.batchCode} · ${plant.batchName}`
          : plant.batchCode
        : plant.batchName ?? 'Sin lote',
      plantedAtRaw: plant.planted_at ?? null,
      firstTransplantAt: formatDate(plant.first_transplant_at),
      plantedAt: formatDate(plant.planted_at),
      ageReferenceDateRaw: ageReferenceDate,
      ageInDays,
      ageLabel: getPlantAgeLabel(events, plant.planted_at ?? null),
      latestEvent: latestEvent
        ? {
            label:
              latestEvent.description ??
              latestEvent.notes ??
              getPlantEventTypeLabel(latestEvent.event_type),
            date: formatDate(latestEvent.event_date),
          }
        : null,
      latestIrrigation: latestIrrigation
        ? {
            label: latestIrrigation.notes ?? latestIrrigation.method ?? 'Sin descripcion',
            date: formatDate(latestIrrigation.irrigation_date),
          }
        : null,
      notes: plant.notes ?? null,
      location: bed
        ? {
            id: bed.id,
            code: bed.code ?? bed.name ?? 'Sin zona',
            rowCount,
            columnCount,
            visualCapacity,
            plants: bedPlants.map((bedPlant) => ({
              id: bedPlant.id,
              code: bedPlant.code ?? 'Sin codigo',
              status: bedPlant.status ?? 'Sin estado',
              stageValue: bedPlant.stage ?? null,
              stage: getPlantStageLabel(bedPlant.stage),
              strain: bedPlant.strain ?? 'Sin genetica',
              rowIndex: Number.isInteger(bedPlant.row_index) ? bedPlant.row_index : null,
              columnIndex: Number.isInteger(bedPlant.column_index) ? bedPlant.column_index : null,
            })),
          }
        : null,
      timeline: events.map((event) => ({
        id: event.id,
        label: getPlantEventTypeLabel(event.event_type),
        value: formatDate(event.event_date) ?? 'Sin fecha',
        notes: event.description ?? event.notes ?? null,
      })),
      events: events.map((event) => ({
        id: event.id,
        event_type: event.event_type ?? null,
        description: event.description ?? event.notes ?? null,
        event_date: event.event_date ?? null,
        event_data: event.event_data ?? null,
        eventData: event.event_data ?? null,
        type: getPlantEventTypeLabel(event.event_type),
        label:
          event.description ??
          event.notes ??
          getPlantEventTypeLabel(event.event_type),
        date: formatDate(event.event_date) ?? 'Sin fecha',
        notes: event.description ?? event.notes ?? null,
      })),
      irrigations: bedIrrigations.map((irrigation) => ({
        id: irrigation.id,
        label: irrigation.notes ?? irrigation.method ?? 'Sin descripcion',
        date: formatDate(irrigation.irrigation_date) ?? 'Sin fecha',
        liters: irrigation.liters ?? null,
        ph: irrigation.ph ?? null,
        ec: irrigation.ec ?? null,
        temperature: irrigation.temperature ?? null,
        humidity: irrigation.humidity ?? null,
        notes: irrigation.notes ?? null,
      })),
    }
  })

  const roomBeds = beds.map((bed) => {
    const bedPlants = plantsByBedId[bed.id] ?? []
    const latestIrrigation = getLatestBy(irrigationsByBedId[bed.id] ?? [], 'irrigation_date')
    const capacity = getPositiveNumber(bed.capacity)
    const rowCount = getPositiveNumber(bed.row_count)
    const columnCount = getPositiveNumber(bed.column_count)
    const gridCapacity = rowCount > 0 && columnCount > 0 ? rowCount * columnCount : 0
    const visualCapacity = gridCapacity > 0 ? gridCapacity : capacity
    const occupancyPercentage =
      visualCapacity > 0 ? Math.round((bedPlants.length / visualCapacity) * 100) : 0
    const state =
      bedPlants.length === 0
        ? 'vacia'
        : visualCapacity > 0 && bedPlants.length >= visualCapacity
          ? 'completa'
          : 'estable'

    return {
      id: bed.id,
      roomId: bed.room_id,
      name: bed.code ?? bed.name ?? 'Sin nombre',
      code: bed.code ?? bed.name ?? 'Sin nombre',
      description: bed.description ?? '',
      statusValue: bed.status ?? 'activa',
      layout_x: bed.layout_x ?? null,
      layout_y: bed.layout_y ?? null,
      layout_width: bed.layout_width ?? null,
      layout_height: bed.layout_height ?? null,
      layout: {
        x: bed.layout_x ?? null,
        y: bed.layout_y ?? null,
        width: bed.layout_width ?? null,
        height: bed.layout_height ?? null,
      },
      status: bedPlants.length > 0 ? 'occupied' : 'empty',
      state,
      capacity,
      rowCount,
      columnCount,
      visualCapacity,
      occupancyPercentage,
      plantCount: bedPlants.length,
      latestIrrigation: formatDateTime(latestIrrigation?.irrigation_date),
      plants: bedPlants.map((plant) => ({
        id: plant.id,
        code: plant.code ?? 'Sin codigo',
        status: plant.status ?? 'Sin estado',
        stageValue: plant.stage ?? null,
        stage: getPlantStageLabel(plant.stage),
        strain: plant.strain ?? 'Sin genetica',
        rowIndex: Number.isInteger(plant.row_index) ? plant.row_index : null,
        columnIndex: Number.isInteger(plant.column_index) ? plant.column_index : null,
      })),
    }
  })
  const roomBedsByRoomId = groupBy(roomBeds, (bed) => bed.roomId)
  const roomSummariesById = roomSummaries.reduce((accumulator, room) => {
    accumulator[room.id] = room
    return accumulator
  }, {})
  const enrichedPlantRows = plantRows.map((plant) => ({
    ...plant,
    roomLocation: plant.roomId
      ? {
          ...(roomSummariesById[plant.roomId] ?? {
            id: plant.roomId,
            name: plant.room ?? 'Sin sala',
          }),
          beds: roomBedsByRoomId[plant.roomId] ?? [],
        }
      : null,
  }))

  const overview = {
    totalRooms: rooms.length,
    totalBeds: beds.length,
    totalPlants: plants.length,
    totalEvents: plantEvents.length,
    totalIrrigations: irrigations.length,
  }

  const plantsByStage = Object.entries(
    plants.reduce((accumulator, plant) => {
      const stage = getPlantStageLabel(plant.stage)
      accumulator[stage] = (accumulator[stage] ?? 0) + 1
      return accumulator
    }, {}),
  )
    .map(([stage, count]) => ({
      stage,
      count,
      percentage: plants.length > 0 ? Math.round((count / plants.length) * 100) : 0,
    }))
    .sort((left, right) => right.count - left.count)

  const roomOccupancy = roomSummaries
    .map((room) => ({
      roomId: room.id,
      name: room.name,
      type: room.type,
      totalBeds: room.bedCount,
      totalPlants: room.plantCount,
      capacity: room.capacity,
      occupancyPercentage: room.occupancyPercentage,
    }))
    .sort((left, right) => right.occupancyPercentage - left.occupancyPercentage)

  const recentEvents = sortByDateDesc(plantEvents, 'event_date')
    .slice(0, 5)
    .map((event) => {
      const plant = plantsById[event.plant_id]
      const bed = plant?.bedId ? bedsById[plant.bedId] : null
      const room = plant?.roomId ? roomsById[plant.roomId] : null

      return {
        id: event.id,
        event_type: getPlantEventTypeLabel(event.event_type),
        description: event.description ?? event.notes ?? null,
        event_date: formatDateTime(event.event_date),
        plant_code: plant?.code ?? null,
        room_name: room?.name ?? null,
        bed_code: bed?.code ?? bed?.name ?? null,
      }
    })

  const recentIrrigations = sortByDateDesc(irrigations, 'irrigation_date')
    .slice(0, 5)
    .map((irrigation) => {
      const bed = bedsById[irrigation.bed_id]
      const room = bed?.room_id ? roomsById[bed.room_id] : null

      return {
        id: irrigation.id,
        irrigation_date: formatDateTime(irrigation.irrigation_date),
        bed_code: bed?.code ?? bed?.name ?? null,
        room_name: room?.name ?? null,
        ph: irrigation.ph ?? null,
        ec: irrigation.ec ?? null,
        liters: irrigation.liters ?? null,
        notes: irrigation.notes ?? null,
      }
    })

  const alerts = [
    {
      id: 'rooms-without-plants',
      label: 'Salas sin plantas',
      count: roomSummaries.filter((room) => room.plantCount === 0).length,
      severity: 'warning',
    },
    {
      id: 'empty-beds',
      label: 'Zonas vacias',
      count: roomBeds.filter((bed) => bed.plantCount === 0).length,
      severity: 'info',
    },
    {
      id: 'plants-without-events',
      label: 'Plantas sin eventos',
      count: plants.filter((plant) => (plantEventsByPlantId[plant.id] ?? []).length === 0).length,
      severity: 'warning',
    },
    {
      id: 'plants-without-irrigations',
      label: 'Plantas sin riegos asociados',
      count: plants.filter((plant) => (irrigationsByBedId[plant.bedId] ?? []).length === 0).length,
      severity: 'info',
    },
  ].filter((alert) => alert.count > 0)

  const overviewDashboard = {
    kpis: overview,
    plantsByStage,
    roomOccupancy,
    recentEvents,
    recentIrrigations,
    alerts,
  }

  return {
    overview,
    overviewDashboard,
    roomSummaries,
    roomBeds,
    plantRows: enrichedPlantRows,
  }
}
