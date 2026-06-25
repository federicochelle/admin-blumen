import { supabase } from '../lib/supabase'

function ensureSupabaseEnv() {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.')
  }
}

function unwrapRelation(value) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

const DEFAULT_ROOM_LAYOUT_WIDTH = 24
const DEFAULT_ROOM_LAYOUT_HEIGHT = 16
const DEFAULT_ZONE_LAYOUT_X = 0
const DEFAULT_ZONE_LAYOUT_Y = 0
const MAX_DEFAULT_ZONE_LAYOUT_WIDTH = 8
const MAX_DEFAULT_ZONE_LAYOUT_HEIGHT = 6

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object ?? {}, key)
}

function normalizeOptionalLayoutDimension(value) {
  if (value === undefined) {
    return undefined
  }

  if (value === null || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function normalizeOptionalLayoutCoordinate(value) {
  if (value === undefined) {
    return undefined
  }

  if (value === null || value === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export async function getRooms() {
  ensureSupabaseEnv()

  const { data, error } = await supabase.from('rooms').select('*').order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getRoomById(roomId) {
  ensureSupabaseEnv()

  console.log('ANTES', 'getRoomById')
  const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No se encontro la sala solicitada.')
  }

  return data
}

export async function getBedsByRoom(roomId) {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('beds')
    .select('*')
    .eq('room_id', roomId)
    .order('code', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getPlants() {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('plants')
    .select(
      `
        id,
        code,
        stage,
        status,
        planted_at,
        first_transplant_at,
        notes,
        row_index,
        column_index,
        strain_id,
        strains (
          id,
          name
        ),
        beds (
          id,
          code,
          room_id,
          rooms (
            id,
            name
          )
        )
      `,
    )
    .order('id', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((plant) => {
    const strain = unwrapRelation(plant.strains)
    const bed = unwrapRelation(plant.beds)
    const room = unwrapRelation(bed?.rooms)

    return {
      id: plant.id,
      code: plant.code,
      stage: plant.stage,
      status: plant.status,
      planted_at: plant.planted_at,
      first_transplant_at: plant.first_transplant_at,
      notes: plant.notes,
      row_index: plant.row_index,
      column_index: plant.column_index,
      strain: strain?.name ?? null,
      strainId: plant.strain_id ?? strain?.id ?? null,
      bed: bed?.code ?? null,
      room: room?.name ?? null,
      bedId: bed?.id ?? null,
      roomId: room?.id ?? bed?.room_id ?? null,
    }
  })
}

export async function getPlantById() {}

export async function getStrains() {
  ensureSupabaseEnv()

  const { data, error } = await supabase.from('strains').select('id, name').order('name', {
    ascending: true,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getPlantEvents(plantId) {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('plant_events')
    .select('*')
    .eq('plant_id', plantId)
    .order('event_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getIrrigationsByBed(bedId) {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('irrigations')
    .select('*')
    .eq('bed_id', bedId)
    .order('irrigation_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getAllPlantEvents() {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('plant_events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getRoomEvents() {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('room_events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getAllIrrigations() {
  ensureSupabaseEnv()

  const { data, error } = await supabase
    .from('irrigations')
    .select('*')
    .order('irrigation_date', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createRoom(payload) {
  ensureSupabaseEnv()

  const roomPayload = {
    name: payload.name,
    type: payload.type,
    status: payload.status,
    description: payload.description ?? null,
  }

  if (hasOwn(payload, 'layout_width')) {
    roomPayload.layout_width =
      normalizeOptionalLayoutDimension(payload.layout_width) ?? DEFAULT_ROOM_LAYOUT_WIDTH
  }

  if (hasOwn(payload, 'layout_height')) {
    roomPayload.layout_height =
      normalizeOptionalLayoutDimension(payload.layout_height) ?? DEFAULT_ROOM_LAYOUT_HEIGHT
  }

  console.log('ANTES', 'createRoom')
  const { data, error } = await supabase.from('rooms').insert(roomPayload).select().single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo crear la sala: ${error.message}`)
  }

  return data
}

export async function createZone(payload) {
  ensureSupabaseEnv()

  const rowCount = Math.max(1, Number(payload.row_count) || 1)
  const columnCount = Math.max(1, Number(payload.column_count) || 1)
  const normalizedLayoutX = normalizeOptionalLayoutCoordinate(payload.layout_x)
  const normalizedLayoutY = normalizeOptionalLayoutCoordinate(payload.layout_y)
  const normalizedLayoutWidth = normalizeOptionalLayoutDimension(payload.layout_width)
  const normalizedLayoutHeight = normalizeOptionalLayoutDimension(payload.layout_height)

  const zonePayload = {
    room_id: payload.room_id,
    code: payload.code?.trim(),
    capacity: Math.max(1, Number(payload.capacity) || 1),
    row_count: rowCount,
    column_count: columnCount,
    status: payload.status?.trim() || 'activa',
    description: payload.description?.trim() || null,
  }

  if (hasOwn(payload, 'layout_x')) {
    zonePayload.layout_x = normalizedLayoutX ?? DEFAULT_ZONE_LAYOUT_X
  }

  if (hasOwn(payload, 'layout_y')) {
    zonePayload.layout_y = normalizedLayoutY ?? DEFAULT_ZONE_LAYOUT_Y
  }

  if (hasOwn(payload, 'layout_width')) {
    zonePayload.layout_width =
      normalizedLayoutWidth ?? Math.min(columnCount, MAX_DEFAULT_ZONE_LAYOUT_WIDTH)
  }

  if (hasOwn(payload, 'layout_height')) {
    zonePayload.layout_height =
      normalizedLayoutHeight ?? Math.min(rowCount, MAX_DEFAULT_ZONE_LAYOUT_HEIGHT)
  }

  if (!hasOwn(payload, 'layout_x')) {
    zonePayload.layout_x = DEFAULT_ZONE_LAYOUT_X
  }

  if (!hasOwn(payload, 'layout_y')) {
    zonePayload.layout_y = DEFAULT_ZONE_LAYOUT_Y
  }

  if (!hasOwn(payload, 'layout_width')) {
    zonePayload.layout_width = Math.min(columnCount, MAX_DEFAULT_ZONE_LAYOUT_WIDTH)
  }

  if (!hasOwn(payload, 'layout_height')) {
    zonePayload.layout_height = Math.min(rowCount, MAX_DEFAULT_ZONE_LAYOUT_HEIGHT)
  }

  console.log('zone payload', zonePayload)
  console.log('ANTES', 'createZone')

  const { data, error } = await supabase.from('beds').insert(zonePayload).select().single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo crear la zona ${payload.code}: ${error.message}`)
  }

  return data
}

export async function createRoomWithZones(roomPayload, zonesPayload) {
  const room = await createRoom(roomPayload)

  try {
    const zones = await Promise.all(
      zonesPayload.map((zone) =>
        createZone({
          ...zone,
          room_id: room.id,
        }),
      ),
    )

    return {
      room,
      zones,
    }
  } catch (error) {
    throw new Error(
      `La sala se creo, pero hubo un problema al crear sus zonas: ${error.message}`,
      { cause: error },
    )
  }
}

export async function updateRoom(payload) {
  ensureSupabaseEnv()

  if (!payload?.id) {
    throw new Error('No se encontro la sala a actualizar.')
  }

  const roomPayload = {
    name: payload.name,
    type: payload.type,
    status: payload.status,
    description: payload.description ?? null,
  }

  if (hasOwn(payload, 'layout_width')) {
    roomPayload.layout_width = normalizeOptionalLayoutDimension(payload.layout_width)
  }

  if (hasOwn(payload, 'layout_height')) {
    roomPayload.layout_height = normalizeOptionalLayoutDimension(payload.layout_height)
  }

  console.log('ANTES', 'updateRoom')
  const { data, error } = await supabase
    .from('rooms')
    .update(roomPayload)
    .eq('id', payload.id)
    .select()
    .single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo actualizar la sala: ${error.message}`)
  }

  return data
}

export async function updateZone(payload) {
  ensureSupabaseEnv()

  if (!payload?.id) {
    throw new Error('No se encontro la zona a actualizar.')
  }

  const nextRowCount = Math.max(1, Number(payload.row_count) || 1)
  const nextColumnCount = Math.max(1, Number(payload.column_count) || 1)

  const { data: plantsInZone, error: plantsInZoneError } = await supabase
    .from('plants')
    .select('id, code, row_index, column_index')
    .eq('bed_id', payload.id)

  if (plantsInZoneError) {
    throw new Error(`No se pudo validar la ocupacion de la zona: ${plantsInZoneError.message}`)
  }

  const positionedPlants = (plantsInZone ?? []).filter(
    (plant) => Number.isInteger(plant.row_index) && Number.isInteger(plant.column_index),
  )
  const hasUnpositionedPlants = (plantsInZone ?? []).some(
    (plant) => !Number.isInteger(plant.row_index) || !Number.isInteger(plant.column_index),
  )
  const maxOccupiedRow = positionedPlants.reduce(
    (highest, plant) => Math.max(highest, plant.row_index + 1),
    0,
  )
  const maxOccupiedColumn = positionedPlants.reduce(
    (highest, plant) => Math.max(highest, plant.column_index + 1),
    0,
  )

  if (nextRowCount < maxOccupiedRow || nextColumnCount < maxOccupiedColumn) {
    throw new Error(
      `No se puede reducir la grilla de la zona ${payload.code} porque hay plantas ocupando posiciones fuera del nuevo limite.`,
    )
  }

  if (
    hasUnpositionedPlants &&
    ((Number.isInteger(payload.previous_row_count) && nextRowCount < payload.previous_row_count) ||
      (Number.isInteger(payload.previous_column_count) &&
        nextColumnCount < payload.previous_column_count))
  ) {
    throw new Error(
      `No se puede reducir la grilla de la zona ${payload.code} porque tiene plantas sin coordenadas definidas.`,
    )
  }

  const zonePayload = {
    code: payload.code?.trim(),
    capacity: nextRowCount * nextColumnCount,
    row_count: nextRowCount,
    column_count: nextColumnCount,
    status: payload.status?.trim() || 'activa',
    description: payload.description?.trim() || null,
  }

  if (hasOwn(payload, 'layout_x')) {
    zonePayload.layout_x = normalizeOptionalLayoutCoordinate(payload.layout_x)
  }

  if (hasOwn(payload, 'layout_y')) {
    zonePayload.layout_y = normalizeOptionalLayoutCoordinate(payload.layout_y)
  }

  if (hasOwn(payload, 'layout_width')) {
    zonePayload.layout_width = normalizeOptionalLayoutDimension(payload.layout_width)
  }

  if (hasOwn(payload, 'layout_height')) {
    zonePayload.layout_height = normalizeOptionalLayoutDimension(payload.layout_height)
  }

  console.log('zone payload', zonePayload)
  console.log('ANTES', 'updateZone')

  const { data, error } = await supabase
    .from('beds')
    .update(zonePayload)
    .eq('id', payload.id)
    .select()
    .single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo actualizar la zona ${payload.code}: ${error.message}`)
  }

  return data
}

export async function deleteZoneIfEmpty(zoneId) {
  ensureSupabaseEnv()

  if (!zoneId) {
    throw new Error('No se encontro la zona a eliminar.')
  }

  const { data: linkedPlant, error: linkedPlantError } = await supabase
    .from('plants')
    .select('id')
    .eq('bed_id', zoneId)
    .limit(1)

  if (linkedPlantError) {
    throw new Error(`No se pudo validar la zona antes de eliminarla: ${linkedPlantError.message}`)
  }

  if ((linkedPlant ?? []).length > 0) {
    throw new Error('No se puede eliminar una zona con plantas asociadas.')
  }

  const { error } = await supabase.from('beds').delete().eq('id', zoneId)

  if (error) {
    throw new Error(`No se pudo eliminar la zona: ${error.message}`)
  }
}

export async function deleteRoomIfEmpty(roomId) {
  ensureSupabaseEnv()

  if (!roomId) {
    throw new Error('No se encontro la sala a eliminar.')
  }

  const { data: linkedBeds, error: linkedBedsError } = await supabase
    .from('beds')
    .select('*')
    .eq('room_id', roomId)

  if (linkedBedsError) {
    throw new Error(`No se pudo validar la sala antes de eliminarla: ${linkedBedsError.message}`)
  }

  const bedIds = (linkedBeds ?? []).map((bed) => bed.id).filter(Boolean)

  if (bedIds.length > 0) {
    const { data: linkedPlants, error: linkedPlantsError } = await supabase
      .from('plants')
      .select('id')
      .in('bed_id', bedIds)
      .limit(1)

    if (linkedPlantsError) {
      throw new Error(`No se pudo validar la sala antes de eliminarla: ${linkedPlantsError.message}`)
    }

    if ((linkedPlants ?? []).length > 0) {
      throw new Error(
        'No es posible eliminar esta sala porque contiene plantas. Traslada o elimina las plantas antes de eliminar la sala.',
      )
    }

    const { error: deleteBedsError } = await supabase.from('beds').delete().eq('room_id', roomId)

    if (deleteBedsError) {
      throw new Error(`No se pudieron eliminar las zonas de la sala: ${deleteBedsError.message}`)
    }
  }

  const { error } = await supabase.from('rooms').delete().eq('id', roomId)

  if (error) {
    if (bedIds.length > 0) {
      const { error: rollbackError } = await supabase.from('beds').insert(linkedBeds)

      if (rollbackError) {
        throw new Error(
          `Las zonas de la sala se eliminaron, pero no se pudo eliminar la sala ni restaurar las zonas: ${error.message}`,
        )
      }
    }

    throw new Error(`No se pudo eliminar la sala: ${error.message}`)
  }
}

export async function createPlant(payload) {
  ensureSupabaseEnv()

  if (!payload?.code?.trim()) {
    throw new Error('El codigo de la planta es obligatorio.')
  }

  if (!payload?.bed_id) {
    throw new Error('La planta debe tener una zona asociada.')
  }

  if (!Number.isInteger(payload.row_index) || !Number.isInteger(payload.column_index)) {
    throw new Error('La posicion seleccionada no es valida.')
  }

  console.log('ANTES', 'createPlant existingPlant lookup')
  const { data: existingPlant, error: existingPlantError } = await supabase
    .from('plants')
    .select('id')
    .eq('bed_id', payload.bed_id)
    .eq('row_index', payload.row_index)
    .eq('column_index', payload.column_index)
    .maybeSingle()
  console.log(existingPlant)
  console.log(existingPlantError)

  if (existingPlantError) {
    throw new Error(`No se pudo validar la posicion: ${existingPlantError.message}`)
  }

  if (existingPlant) {
    throw new Error('La posicion seleccionada ya esta ocupada por otra planta.')
  }

  const plantPayload = {
    code: payload.code.trim(),
    strain_id: payload.strain_id ?? null,
    stage: payload.stage?.trim() || null,
    bed_id: payload.bed_id,
    row_index: payload.row_index,
    column_index: payload.column_index,
    planted_at: payload.planted_at,
    notes: payload.notes?.trim() ? payload.notes.trim() : null,
  }

  console.log('ANTES', 'createPlant insert')
  const { data: plant, error: plantError } = await supabase
    .from('plants')
    .insert(plantPayload)
    .select()
    .single()
  console.log(plant)
  console.log(plantError)

  if (plantError) {
    if (plantError.code === '23505') {
      throw new Error('La posicion seleccionada ya esta ocupada por otra planta.')
    }

    throw new Error(`No se pudo crear la planta: ${plantError.message}`)
  }

  try {
    await createPlantEvent({
      plant_id: plant.id,
      event_type: 'CREACION',
      event_date: payload.event_date ?? payload.planted_at,
      description: payload.event_description?.trim() || null,
      created_by: payload.created_by ?? 'admin',
    })
  } catch (error) {
    const { error: rollbackError } = await supabase.from('plants').delete().eq('id', plant.id)

    if (rollbackError) {
      throw new Error(
        `La planta se creo, pero no se pudo registrar el evento inicial ni revertir la operacion: ${error.message}`,
        { cause: error },
      )
    }

    throw new Error(`No se pudo registrar el evento inicial: ${error.message}`, { cause: error })
  }

  return plant
}

export async function updatePlant(payload) {
  ensureSupabaseEnv()

  if (!payload?.id) {
    throw new Error('No se encontro la planta a actualizar.')
  }

  const plantPayload = {}

  if (Object.prototype.hasOwnProperty.call(payload, 'code')) {
    if (!payload.code?.trim()) {
      throw new Error('El codigo de la planta es obligatorio.')
    }

    plantPayload.code = payload.code.trim()
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'strain_id')) {
    if (!payload.strain_id) {
      throw new Error('La genetica es obligatoria.')
    }

    plantPayload.strain_id = payload.strain_id
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'stage')) {
    if (!payload.stage?.trim()) {
      throw new Error('La etapa es obligatoria.')
    }

    plantPayload.stage = payload.stage.trim()
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'planted_at')) {
    plantPayload.planted_at = payload.planted_at ?? null
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'notes')) {
    plantPayload.notes = payload.notes?.trim() ? payload.notes.trim() : null
  }

  if (Object.keys(plantPayload).length === 0) {
    throw new Error('No hay cambios para actualizar en la planta.')
  }

  console.log('ANTES', 'updatePlant')
  const { data, error } = await supabase
    .from('plants')
    .update(plantPayload)
    .eq('id', payload.id)
    .select()
    .single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo actualizar la planta: ${error.message}`)
  }

  return data
}

export async function movePlant(payload) {
  ensureSupabaseEnv()
  console.log('movePlant received payload', payload)

  if (!payload?.plant_id) {
    throw new Error('La planta a mover es obligatoria.')
  }

  if (!payload?.to_bed_id) {
    throw new Error('La zona de destino es obligatoria.')
  }

  if (!Number.isInteger(payload.to_row_index) || !Number.isInteger(payload.to_column_index)) {
    throw new Error('La posicion destino no es valida.')
  }

  console.log('ANTES', 'movePlant destinationBed lookup')
  const { data: destinationBed, error: destinationBedError } = await supabase
    .from('beds')
    .select('id, code, row_count, column_count')
    .eq('id', payload.to_bed_id)
    .maybeSingle()
  console.log(destinationBed)
  console.log(destinationBedError)

  if (destinationBedError) {
    throw new Error(`No se pudo validar la zona de destino: ${destinationBedError.message}`)
  }

  if (!destinationBed) {
    throw new Error('La zona de destino no existe.')
  }

  const rowCount = Number(destinationBed.row_count) || 0
  const columnCount = Number(destinationBed.column_count) || 0

  console.log('destination slot query', {
    bed_id: payload.to_bed_id,
    row_index: payload.to_row_index,
    column_index: payload.to_column_index,
  })

  if (
    rowCount > 0 &&
    columnCount > 0 &&
    (payload.to_row_index < 0 ||
      payload.to_column_index < 0 ||
      payload.to_row_index >= rowCount ||
      payload.to_column_index >= columnCount)
  ) {
    throw new Error('La posicion destino queda fuera de la grilla de la zona seleccionada.')
  }

  console.log('ANTES', 'movePlant destinationOccupant lookup')
  const { data: destinationOccupant, error: destinationOccupantError } = await supabase
    .from('plants')
    .select('id')
    .eq('bed_id', payload.to_bed_id)
    .eq('row_index', payload.to_row_index)
    .eq('column_index', payload.to_column_index)
    .neq('id', payload.plant_id)
    .maybeSingle()
  console.log(destinationOccupant)
  console.log(destinationOccupantError)

  if (destinationOccupantError) {
    throw new Error(`No se pudo validar la posicion destino: ${destinationOccupantError.message}`)
  }

  if (destinationOccupant) {
    throw new Error('La posicion destino ya esta ocupada por otra planta.')
  }

  console.log('ANTES', 'movePlant currentPlant lookup')
  const { data: currentPlant, error: currentPlantError } = await supabase
    .from('plants')
    .select('id, bed_id, row_index, column_index')
    .eq('id', payload.plant_id)
    .maybeSingle()
  console.log(currentPlant)
  console.log(currentPlantError)

  if (currentPlantError) {
    throw new Error(`No se pudo validar la planta a mover: ${currentPlantError.message}`)
  }

  if (!currentPlant) {
    throw new Error('No se encontro la planta a mover.')
  }

  const nextPlantPayload = {
    bed_id: payload.to_bed_id,
    row_index: payload.to_row_index,
    column_index: payload.to_column_index,
  }

  const { error: moveError } = await supabase
    .from('plants')
    .update(nextPlantPayload)
    .eq('id', payload.plant_id)

  if (moveError) {
    if (moveError.code === '23505') {
      throw new Error('La posicion destino ya esta ocupada por otra planta.')
    }

    throw new Error(`No se pudo mover la planta: ${moveError.message}`)
  }

  try {
    await createPlantEvent({
      plant_id: payload.plant_id,
      event_type: 'CAMBIO_UBICACION',
      event_date: payload.event_date ?? new Date().toISOString(),
      description: payload.description?.trim() || null,
      created_by: payload.created_by ?? 'admin',
    })
  } catch (error) {
    const { error: rollbackError } = await supabase
      .from('plants')
      .update({
        bed_id: payload.from_bed_id,
        row_index: payload.from_row_index,
        column_index: payload.from_column_index,
      })
      .eq('id', payload.plant_id)

    if (rollbackError) {
      throw new Error(
        `La planta se movio, pero no se pudo registrar el evento ni revertir la ubicacion: ${error.message}`,
        { cause: error },
      )
    }

    throw new Error(`No se pudo registrar el movimiento: ${error.message}`, { cause: error })
  }

  return {
    id: currentPlant.id,
    ...nextPlantPayload,
  }
}

export async function createPlantEvent(payload) {
  ensureSupabaseEnv()

  const eventPayload = {
    plant_id: payload.plant_id,
    event_type: payload.event_type,
    event_date: payload.event_date,
    description: payload.description ?? null,
    event_data: payload.event_data ?? null,
    created_by: payload.created_by ?? 'admin',
  }

  const { data, error } = await supabase.from('plant_events').insert(eventPayload)

  if (error) {
    throw new Error(`No se pudo crear el evento: ${error.message}`)
  }

  return data ?? null
}

export async function createRoomEvent(payload) {
  ensureSupabaseEnv()

  const eventPayload = {
    room_id: payload.room_id,
    event_type: payload.event_type,
    event_date: payload.event_date,
    description: payload.description ?? null,
    event_data: payload.event_data ?? null,
    created_by: payload.created_by ?? 'admin',
  }

  const { data, error } = await supabase.from('room_events').insert(eventPayload)

  if (error) {
    throw new Error(`No se pudo crear el evento de sala: ${error.message}`)
  }

  return data ?? null
}

export async function deleteRoomEvent(eventId) {
  ensureSupabaseEnv()

  if (!eventId) {
    throw new Error('No se encontro el evento de sala a eliminar.')
  }

  const { error } = await supabase
    .from('room_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    const normalizedMessage = String(error.message ?? '').toLowerCase()

    if (
      error.code === '42501' ||
      normalizedMessage.includes('row-level security') ||
      normalizedMessage.includes('permission denied') ||
      normalizedMessage.includes('not allowed')
    ) {
      throw new Error('No tienes permisos para eliminar este evento de sala por las politicas de seguridad (RLS).')
    }

    throw new Error(`No se pudo eliminar el evento de sala: ${error.message}`)
  }
}

export async function deletePlantEvent(eventId) {
  ensureSupabaseEnv()

  if (!eventId) {
    throw new Error('No se encontro el evento a eliminar.')
  }

  const { error } = await supabase
    .from('plant_events')
    .delete()
    .eq('id', eventId)

  if (error) {
    const normalizedMessage = String(error.message ?? '').toLowerCase()

    if (
      error.code === '42501' ||
      normalizedMessage.includes('row-level security') ||
      normalizedMessage.includes('permission denied') ||
      normalizedMessage.includes('not allowed')
    ) {
      throw new Error('No tienes permisos para eliminar este evento por las politicas de seguridad (RLS).')
    }

    throw new Error(`No se pudo eliminar el evento: ${error.message}`)
  }
}

export async function deletePlant(plantId) {
  ensureSupabaseEnv()

  if (!plantId) {
    throw new Error('No se encontro la planta a eliminar.')
  }

  const { data: plant, error: plantLookupError } = await supabase
    .from('plants')
    .select('id, bed_id')
    .eq('id', plantId)
    .maybeSingle()

  if (plantLookupError) {
    throw new Error(`No se pudo validar la planta antes de eliminarla: ${plantLookupError.message}`)
  }

  if (!plant) {
    throw new Error('No se encontro la planta a eliminar.')
  }

  const { data: plantEvents, error: plantEventsLookupError } = await supabase
    .from('plant_events')
    .select('*')
    .eq('plant_id', plantId)

  if (plantEventsLookupError) {
    throw new Error(`No se pudieron validar los eventos de la planta: ${plantEventsLookupError.message}`)
  }

  let irrigationsToRestore = []

  if (plant.bed_id) {
    const { data: siblingPlants, error: siblingPlantsError } = await supabase
      .from('plants')
      .select('id')
      .eq('bed_id', plant.bed_id)
      .neq('id', plantId)
      .limit(1)

    if (siblingPlantsError) {
      throw new Error(`No se pudo validar la zona de la planta: ${siblingPlantsError.message}`)
    }

    if ((siblingPlants ?? []).length === 0) {
      const { data: irrigations, error: irrigationsLookupError } = await supabase
        .from('irrigations')
        .select('*')
        .eq('bed_id', plant.bed_id)

      if (irrigationsLookupError) {
        throw new Error(`No se pudieron validar los riegos de la planta: ${irrigationsLookupError.message}`)
      }

      irrigationsToRestore = irrigations ?? []
    }
  }

  if ((plantEvents ?? []).length > 0) {
    const { error: deletePlantEventsError } = await supabase
      .from('plant_events')
      .delete()
      .eq('plant_id', plantId)

    if (deletePlantEventsError) {
      throw new Error(`No se pudieron eliminar los eventos de la planta: ${deletePlantEventsError.message}`)
    }
  }

  if (irrigationsToRestore.length > 0) {
    const { error: deleteIrrigationsError } = await supabase
      .from('irrigations')
      .delete()
      .eq('bed_id', plant.bed_id)

    if (deleteIrrigationsError) {
      if ((plantEvents ?? []).length > 0) {
        await supabase.from('plant_events').insert(plantEvents)
      }

      throw new Error(`No se pudieron eliminar los riegos de la planta: ${deleteIrrigationsError.message}`)
    }
  }

  const { error: deletePlantError } = await supabase.from('plants').delete().eq('id', plantId)

  if (deletePlantError) {
    let rollbackIssues = []

    if (irrigationsToRestore.length > 0) {
      const { error: restoreIrrigationsError } = await supabase
        .from('irrigations')
        .insert(irrigationsToRestore)

      if (restoreIrrigationsError) {
        rollbackIssues.push('riegos')
      }
    }

    if ((plantEvents ?? []).length > 0) {
      const { error: restorePlantEventsError } = await supabase
        .from('plant_events')
        .insert(plantEvents)

      if (restorePlantEventsError) {
        rollbackIssues.push('eventos')
      }
    }

    if (rollbackIssues.length > 0) {
      throw new Error(
        `No se pudo eliminar la planta y tampoco restaurar ${rollbackIssues.join(' y ')} asociados: ${deletePlantError.message}`,
      )
    }

    throw new Error(`No se pudo eliminar la planta: ${deletePlantError.message}`)
  }
}

export async function createPlantEventsBatch(payloads) {
  ensureSupabaseEnv()

  if (!Array.isArray(payloads) || payloads.length === 0) {
    throw new Error('No hay eventos para registrar.')
  }

  const eventPayloads = payloads.map((payload) => ({
    plant_id: payload.plant_id,
    event_type: payload.event_type,
    event_date: payload.event_date,
    description: payload.description ?? null,
    event_data: payload.event_data ?? null,
    created_by: payload.created_by ?? 'admin',
  }))

  const { data, error } = await supabase.from('plant_events').insert(eventPayloads)

  if (error) {
    throw new Error(`No se pudieron crear los eventos: ${error.message}`)
  }

  return data ?? null
}

export async function createIrrigation(payload) {
  ensureSupabaseEnv()

  const irrigationPayload = {
    bed_id: payload.bed_id,
    irrigation_date: payload.irrigation_date,
    liters: payload.liters ?? null,
    ph: payload.ph ?? null,
    ec: payload.ec ?? null,
    temperature: payload.temperature ?? null,
    humidity: payload.humidity ?? null,
    notes: payload.notes ?? null,
  }

  if (payload.method) {
    irrigationPayload.method = payload.method
  }

  console.log('ANTES', 'createIrrigation')
  const { data, error } = await supabase
    .from('irrigations')
    .insert(irrigationPayload)
    .select()
    .single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo crear el riego: ${error.message}`)
  }

  return data
}

export async function appendPlantObservation(plantId, observation, currentNotes = '') {
  ensureSupabaseEnv()

  const timestamp = new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Montevideo',
  })
    .format(new Date())
    .replace(' ', ' ')

  const nextEntry = `[${timestamp}] ${observation.trim()}`
  const nextNotes = currentNotes?.trim() ? `${currentNotes.trim()}\n${nextEntry}` : nextEntry

  console.log('ANTES', 'appendPlantObservation')
  const { data, error } = await supabase
    .from('plants')
    .update({ notes: nextNotes })
    .eq('id', plantId)
    .select('id, notes')
    .single()
  console.log(data)
  console.log(error)

  if (error) {
    throw new Error(`No se pudo guardar la observacion: ${error.message}`)
  }

  return data
}
