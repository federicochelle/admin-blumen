import { useMemo, useState } from 'react'
import NewPlantModal from '../plants/NewPlantModal'
import RoomBedsOverview from './RoomBedsOverview'
import ZoneFormRow from './ZoneFormRow'

const ROOM_TYPE_OPTIONS = ['Germinacion', 'Vegetacion', 'Floracion', 'Secado']
const DEFAULT_ROOM_LAYOUT_WIDTH = 24
const DEFAULT_ROOM_LAYOUT_HEIGHT = 16

function createEmptyZone() {
  return {
    code: '',
    row_count: 1,
    column_count: 1,
    capacity: 1,
    status: 'activa',
    description: '',
    plantCount: 0,
    plants: [],
    maxOccupiedRow: 0,
    maxOccupiedColumn: 0,
    hasUnpositionedPlants: false,
    previous_row_count: 1,
    previous_column_count: 1,
    layout_x: null,
    layout_y: null,
    layout_width: null,
    layout_height: null,
  }
}

function buildRoomState(initialRoom = null) {
  return {
    id: initialRoom?.id ?? null,
    name: initialRoom?.name ?? '',
    type: initialRoom?.type ?? '',
    description: initialRoom?.description ?? '',
    status: initialRoom?.status,
    layout_width:
      initialRoom?.layout_width ?? initialRoom?.layout?.width ?? DEFAULT_ROOM_LAYOUT_WIDTH,
    layout_height:
      initialRoom?.layout_height ?? initialRoom?.layout?.height ?? DEFAULT_ROOM_LAYOUT_HEIGHT,
  }
}

function buildZoneState(initialZones = []) {
  return initialZones.map((zone) => {
    const rowCount = Math.max(1, Number(zone.row_count) || 1)
    const columnCount = Math.max(1, Number(zone.column_count) || 1)

    return {
      id: zone.id ?? null,
      code: zone.code ?? '',
      row_count: rowCount,
      column_count: columnCount,
      capacity: Number(zone.capacity) || rowCount * columnCount,
      status: zone.status ?? 'activa',
      description: zone.description ?? '',
      plantCount: Number(zone.plantCount) || 0,
      plants: Array.isArray(zone.plants) ? zone.plants : [],
      maxOccupiedRow: Number(zone.maxOccupiedRow) || 0,
      maxOccupiedColumn: Number(zone.maxOccupiedColumn) || 0,
      hasUnpositionedPlants: Boolean(zone.hasUnpositionedPlants),
      previous_row_count: Number(zone.previous_row_count) || rowCount,
      previous_column_count: Number(zone.previous_column_count) || columnCount,
      layout_x: zone.layout_x ?? zone.layout?.x ?? null,
      layout_y: zone.layout_y ?? zone.layout?.y ?? null,
      layout_width: zone.layout_width ?? zone.layout?.width ?? null,
      layout_height: zone.layout_height ?? zone.layout?.height ?? null,
    }
  })
}

function buildOptions(baseOptions, currentValue) {
  if (currentValue && !baseOptions.includes(currentValue)) {
    return [currentValue, ...baseOptions]
  }

  return baseOptions
}

function validateRoom({ room, zones }) {
  const errors = {
    room: {},
    zones: [],
  }

  if (!room.name.trim()) {
    errors.room.name = 'El nombre es obligatorio.'
  }

  if (!room.type.trim()) {
    errors.room.type = 'El tipo es obligatorio.'
  }

  if (zones.length === 0) {
    errors.room.zones = 'Debes agregar al menos una zona.'
  }

  const usedCodes = new Set()

  errors.zones = zones.map((zone) => {
    const zoneErrors = {}
    const rowCount = Math.max(1, Number(zone.row_count) || 1)
    const columnCount = Math.max(1, Number(zone.column_count) || 1)
    const normalizedCode = zone.code.trim().toLowerCase()

    if (!zone.code.trim()) {
      zoneErrors.code = 'El codigo es obligatorio.'
    } else if (usedCodes.has(normalizedCode)) {
      zoneErrors.code = 'El codigo de zona debe ser unico dentro de la sala.'
    } else {
      usedCodes.add(normalizedCode)
    }

    if (rowCount < 1) {
      zoneErrors.row_count = 'Debe ser al menos 1.'
    }

    if (columnCount < 1) {
      zoneErrors.column_count = 'Debe ser al menos 1.'
    }

    if (rowCount * columnCount < 1) {
      zoneErrors.capacity = 'La capacidad debe ser al menos 1.'
    }

    if (rowCount < zone.maxOccupiedRow) {
      zoneErrors.row_count = `No puedes reducir las filas por debajo de la ocupacion actual (${zone.maxOccupiedRow}).`
    }

    if (columnCount < zone.maxOccupiedColumn) {
      zoneErrors.column_count = `No puedes reducir las columnas por debajo de la ocupacion actual (${zone.maxOccupiedColumn}).`
    }

    const isReducingRows = rowCount < (Number(zone.previous_row_count) || rowCount)
    const isReducingColumns = columnCount < (Number(zone.previous_column_count) || columnCount)

    if (zone.hasUnpositionedPlants && (isReducingRows || isReducingColumns)) {
      zoneErrors.row_count =
        zoneErrors.row_count ??
        'No puedes reducir la grilla porque esta zona tiene plantas sin coordenadas.'
      zoneErrors.column_count =
        zoneErrors.column_count ??
        'No puedes reducir la grilla porque esta zona tiene plantas sin coordenadas.'
    }

    return zoneErrors
  })

  const hasZoneErrors = errors.zones.some((zoneError) => Object.keys(zoneError).length > 0)
  const hasRoomErrors = Object.keys(errors.room).length > 0

  return {
    errors,
    valid: !hasZoneErrors && !hasRoomErrors,
  }
}

function ZoneEditorModal({
  open,
  onClose,
  zone,
  zoneError,
  title,
  onConfirm,
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Cerrar editor de zona"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-slate-950/30 transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <section className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 pb-1">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                {title}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/55 bg-brand-deep-purple text-white transition hover:border-brand-deeper-purple hover:bg-brand-deeper-purple"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-5 max-h-[70vh] overflow-y-auto pr-1">
            {zone ? (
              <div className="mt-4 space-y-4">
                <ZoneFormRow
                  key={`${title}-${zone.id ?? 'new'}-${zone.code}-${zone.row_count}-${zone.column_count}`}
                  zone={zone}
                  error={zoneError}
                  onChange={() => {}}
                  onConfirm={onConfirm}
                />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  )
}

function RoomFormView({
  mode,
  initialRoom,
  initialZones,
  onSubmit,
  onBack,
  onPlantCreated,
}) {
  const [room, setRoom] = useState(() => buildRoomState(initialRoom))
  const [zones, setZones] = useState(() => buildZoneState(initialZones))
  const [deletedZoneIds, setDeletedZoneIds] = useState([])
  const [errors, setErrors] = useState({ room: {}, zones: [] })
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [zoneEditor, setZoneEditor] = useState({
    open: false,
    index: null,
    zone: null,
    title: 'Nueva zona',
  })
  const [selectedEmptySlot, setSelectedEmptySlot] = useState(null)
  const [isNewPlantModalOpen, setIsNewPlantModalOpen] = useState(false)
  const originalZonesById = useMemo(
    () =>
      (initialZones ?? []).reduce((accumulator, zone) => {
        if (zone?.id) {
          accumulator[zone.id] = zone
        }

        return accumulator
      }, {}),
    [initialZones],
  )

  const previewBeds = useMemo(
    () =>
      zones.map((zone, index) => {
        const originalZone = zone.id ? originalZonesById[zone.id] : null
        const rowCount = Math.max(1, Number(zone.row_count) || 1)
        const columnCount = Math.max(1, Number(zone.column_count) || 1)
        const visualCapacity = rowCount * columnCount
        const previewPlants = Array.isArray(zone.plants) && zone.plants.length > 0
          ? zone.plants
          : Array.isArray(originalZone?.plants)
            ? originalZone.plants
            : []
        const previewPlantCount =
          Number(zone.plantCount) > 0
            ? Number(zone.plantCount)
            : Number(originalZone?.plantCount) || previewPlants.length

        return {
          id: zone.id ?? `preview-zone-${index}`,
          previewIndex: index,
          roomId: room.id ?? 'preview-room',
          code: zone.code.trim() || `Z${index + 1}`,
          name: zone.code.trim() || `Z${index + 1}`,
          state: zone.status?.trim() || 'activa',
          status: previewPlantCount > 0 ? 'occupied' : 'empty',
          capacity: visualCapacity,
          rowCount,
          columnCount,
          visualCapacity,
          occupancyPercentage:
            previewPlantCount > 0 ? Math.round((previewPlantCount / visualCapacity) * 100) : 0,
          plantCount: previewPlantCount,
          latestIrrigation: null,
          plants: previewPlants,
          allowEmptySlotCreate: mode === 'edit' && Boolean(zone.id),
          layout_x: zone.layout_x ?? null,
          layout_y: zone.layout_y ?? null,
          layout_width: zone.layout_width ?? null,
          layout_height: zone.layout_height ?? null,
          layout: {
            x: zone.layout_x ?? null,
            y: zone.layout_y ?? null,
            width: zone.layout_width ?? null,
            height: zone.layout_height ?? null,
          },
        }
      }),
    [mode, originalZonesById, room.id, zones],
  )

  const roomTypeOptions = useMemo(() => buildOptions(ROOM_TYPE_OPTIONS, room.type), [room.type])

  function updateZone(index, nextZone) {
    setZones((current) =>
      current.map((zone, zoneIndex) => {
        if (zoneIndex !== index) {
          return zone
        }

        const mergedZone = {
          ...zone,
          ...nextZone,
        }

        return {
          ...mergedZone,
          capacity:
            Math.max(1, Number(mergedZone.row_count) || 1) *
            Math.max(1, Number(mergedZone.column_count) || 1),
        }
      }),
    )
  }

  function closeZoneEditor() {
    setZoneEditor({
      open: false,
      index: null,
      zone: null,
      title: 'Nueva zona',
    })
  }

  function openNewZoneEditor() {
    setZoneEditor({
      open: true,
      index: null,
      zone: createEmptyZone(),
      title: 'Nueva zona',
    })
  }

  function openExistingZoneEditor(index) {
    setZoneEditor({
      open: true,
      index,
      zone: zones[index],
      title: zones[index]?.code?.trim() || `Zona ${index + 1}`,
    })
  }

  function handleRemoveZone(index) {
    const zone = zones[index]

    if (!zone) {
      return
    }

    if ((Number(zone.plantCount) || 0) > 0) {
      setSubmitError('No se puede eliminar una zona con plantas asociadas.')
      return
    }

    setSubmitError('')
    setZones((current) => current.filter((_, zoneIndex) => zoneIndex !== index))

    if (zone.id) {
      setDeletedZoneIds((current) => [...current, zone.id])
    }
  }

  function saveZone(nextZone) {
    if (zoneEditor.index === null) {
      setZones((current) => [
        ...current,
        {
          ...createEmptyZone(),
          ...nextZone,
          capacity:
            Math.max(1, Number(nextZone.row_count) || 1) *
            Math.max(1, Number(nextZone.column_count) || 1),
        },
      ])
      setErrors((current) => ({
        ...current,
        room: { ...current.room, zones: undefined },
      }))
      closeZoneEditor()
      return
    }

    updateZone(zoneEditor.index, nextZone)
    closeZoneEditor()
  }

  function handleEmptySlotClick(slot) {
    if (!slot?.bed?.id) {
      setSubmitError('Guarda la sala primero para cargar plantas en una zona nueva.')
      return
    }

    setSubmitError('')
    setSelectedEmptySlot(slot)
    setIsNewPlantModalOpen(true)
  }

  function handleCloseNewPlantModal() {
    setIsNewPlantModalOpen(false)
    setSelectedEmptySlot(null)
  }

  async function handlePlantCreated(createdPlant) {
    if (createdPlant?.bedId && Number.isInteger(createdPlant.rowIndex) && Number.isInteger(createdPlant.columnIndex)) {
      setZones((current) =>
        current.map((zone) => {
          if (String(zone.id ?? '') !== String(createdPlant.bedId)) {
            return zone
          }

          const currentPlants = Array.isArray(zone.plants) ? zone.plants : []
          const nextPlants = currentPlants.filter((plant) => {
            return !(
              Number.isInteger(plant?.rowIndex) &&
              Number.isInteger(plant?.columnIndex) &&
              plant.rowIndex === createdPlant.rowIndex &&
              plant.columnIndex === createdPlant.columnIndex
            )
          })

          nextPlants.push(createdPlant)

          return {
            ...zone,
            plants: nextPlants,
            plantCount: nextPlants.length,
            maxOccupiedRow: Math.max(zone.maxOccupiedRow ?? 0, createdPlant.rowIndex + 1),
            maxOccupiedColumn: Math.max(zone.maxOccupiedColumn ?? 0, createdPlant.columnIndex + 1),
          }
        }),
      )
    }

    await onPlantCreated?.(createdPlant)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validation = validateRoom({ room, zones })
    setErrors(validation.errors)

    if (!validation.valid) {
      const invalidZoneIndex = validation.errors.zones.findIndex(
        (zoneError) => Object.keys(zoneError).length > 0,
      )

      if (invalidZoneIndex >= 0) {
        openExistingZoneEditor(invalidZoneIndex)
      } else if (validation.errors.room.zones) {
        openNewZoneEditor()
      }
      return
    }

    setSaving(true)

    try {
      await onSubmit?.({
        room: {
          id: room.id,
          name: room.name.trim(),
          type: room.type.trim(),
          status: 'activa',
          description: room.description.trim(),
          layout_width: room.layout_width ?? DEFAULT_ROOM_LAYOUT_WIDTH,
          layout_height: room.layout_height ?? DEFAULT_ROOM_LAYOUT_HEIGHT,
        },
        zones: zones.map((zone) => ({
          id: zone.id,
          code: zone.code.trim(),
          capacity:
            Math.max(1, Number(zone.row_count) || 1) *
            Math.max(1, Number(zone.column_count) || 1),
          row_count: Math.max(1, Number(zone.row_count) || 1),
          column_count: Math.max(1, Number(zone.column_count) || 1),
          status: zone.status?.trim() || 'activa',
          description: zone.description?.trim() || '',
          plantCount: zone.plantCount ?? 0,
          maxOccupiedRow: zone.maxOccupiedRow ?? 0,
          maxOccupiedColumn: zone.maxOccupiedColumn ?? 0,
          hasUnpositionedPlants: zone.hasUnpositionedPlants ?? false,
          previous_row_count: zone.previous_row_count ?? zone.row_count,
          previous_column_count: zone.previous_column_count ?? zone.column_count,
          layout_x: zone.layout_x ?? null,
          layout_y: zone.layout_y ?? null,
          layout_width: zone.layout_width ?? null,
          layout_height: zone.layout_height ?? null,
        })),
        deletedZoneIds,
      })
    } catch (error) {
      setSubmitError(error.message ?? 'No se pudo guardar la sala.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Datos de sala
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input
                type="text"
                required
                value={room.name}
                onChange={(event) => setRoom((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
              {errors.room.name ? <span className="text-xs text-red-600">{errors.room.name}</span> : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tipo</span>
              <select
                required
                value={room.type}
                onChange={(event) => setRoom((current) => ({ ...current, type: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              >
                <option value="">Selecciona un tipo</option>
                {roomTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.room.type ? <span className="text-xs text-red-600">{errors.room.type}</span> : null}
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Descripcion</span>
              <textarea
                rows="3"
                value={room.description}
                onChange={(event) =>
                  setRoom((current) => ({ ...current, description: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Distribucion de la sala
              </p>
            </div>
            <button
              type="button"
              onClick={openNewZoneEditor}
              className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple"
            >
              + Agregar zona
            </button>
          </div>

          <div className="mt-4">
            <RoomBedsOverview
              room={{
                id: room.id,
                name: room.name,
                layout_width: room.layout_width ?? null,
                layout_height: room.layout_height ?? null,
              }}
              beds={previewBeds}
              showCount={false}
              useLayoutCanvas
              onEditBed={(bed) => openExistingZoneEditor(bed.previewIndex)}
              onDeleteBed={(bed) => handleRemoveZone(bed.previewIndex)}
              onEmptySlotClick={mode === 'edit' ? handleEmptySlotClick : null}
              editable
              onBedLayoutCommit={(bed, nextLayout) => {
                const zoneIndex = bed.previewIndex

                if (!Number.isInteger(zoneIndex)) {
                  return
                }

                updateZone(zoneIndex, nextLayout)
              }}
              embedded
            />
          </div>
        </section>

        {submitError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-brand-lavender/55 bg-white px-4 py-2.5 text-sm font-medium text-brand-deep-purple transition hover:border-brand-deep-purple hover:bg-brand-light-lilac/18 hover:text-brand-deeper-purple"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              saving
                ? 'cursor-wait bg-brand-light-lilac text-white'
                : 'bg-brand-turquoise text-white hover:bg-brand-deep-purple'
            }`}
          >
            {saving
              ? mode === 'edit'
                ? 'Guardando sala...'
                : 'Creando sala...'
              : mode === 'edit'
                ? 'Guardar cambios'
                : 'Crear sala'}
          </button>
        </div>
      </form>

      <ZoneEditorModal
        open={zoneEditor.open}
        onClose={closeZoneEditor}
        zone={zoneEditor.zone}
        zoneError={zoneEditor.index !== null ? errors.zones[zoneEditor.index] : {}}
        title={zoneEditor.title}
        onConfirm={saveZone}
      />

      <NewPlantModal
        open={isNewPlantModalOpen}
        slot={selectedEmptySlot}
        onClose={handleCloseNewPlantModal}
        onCreated={handlePlantCreated}
      />
    </section>
  )
}

export default RoomFormView
