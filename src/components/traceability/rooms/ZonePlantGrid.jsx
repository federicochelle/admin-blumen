import EmptyState from '../../shared/EmptyState'
import PlantSlot from './PlantSlot'

function getCoordinateValue(value) {
  return Number.isInteger(value) ? value : null
}

function buildMatrixSlots(zone, plants, rowCount, columnCount) {
  const slots = []
  const overflowPlants = []
  const plantsByCoordinate = new Map()

  plants.forEach((plant) => {
    const rowIndex = getCoordinateValue(plant.rowIndex)
    const columnIndex = getCoordinateValue(plant.columnIndex)

    if (
      rowIndex === null ||
      columnIndex === null ||
      rowIndex < 0 ||
      columnIndex < 0 ||
      rowIndex >= rowCount ||
      columnIndex >= columnCount
    ) {
      overflowPlants.push(plant)
      return
    }

    const key = `${rowIndex}:${columnIndex}`

    if (plantsByCoordinate.has(key)) {
      overflowPlants.push(plant)
      return
    }

    plantsByCoordinate.set(key, plant)
  })

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const key = `${rowIndex}:${columnIndex}`

      slots.push({
        id: `slot-${zone.id}-${rowIndex}-${columnIndex}`,
        plant: plantsByCoordinate.get(key) ?? null,
        rowIndex,
        columnIndex,
      })
    }
  }

  return {
    columns: columnCount,
    slots: [
      ...slots,
      ...overflowPlants.map((plant, index) => ({
        id: `slot-${zone.id}-overflow-${plant.id ?? index}`,
        plant,
        rowIndex: null,
        columnIndex: null,
        isOverflow: true,
      })),
    ],
  }
}

function buildZoneSlots(zone) {
  const plants = zone.plants ?? []
  const rowCount = Number(zone.rowCount) || 0
  const columnCount = Number(zone.columnCount) || 0
  const visualCapacity = Number(zone.visualCapacity) || 0

  if (rowCount > 0 && columnCount > 0) {
    return {
      mode: 'matrix',
      ...buildMatrixSlots(zone, plants, rowCount, columnCount),
    }
  }

  if (visualCapacity > 0) {
    return {
      mode: 'flow',
      columns: Math.min(visualCapacity, 8),
      slots: Array.from({ length: Math.max(visualCapacity, plants.length) }, (_, index) => ({
        id: `slot-${zone.id}-${index}`,
        plant: plants[index] ?? null,
        rowIndex: null,
        columnIndex: null,
      })),
    }
  }

  if (plants.length > 0) {
    return {
      mode: 'flow',
      columns: Math.min(plants.length, 8),
      slots: plants.map((plant) => ({
        id: plant.id,
        plant,
        rowIndex: null,
        columnIndex: null,
      })),
    }
  }

  return {
    mode: 'empty',
    columns: 0,
    slots: [],
  }
}

function ZonePlantGrid({
  zone,
  selectedPlantId = null,
  selectedPlantIds = null,
  selectedSlotId = null,
  onPlantClick,
  onEmptySlotClick,
  selectedEmphasis = 'default',
  renderMetrics = null,
}) {
  const { slots, columns, mode } = buildZoneSlots(zone)
  const safeColumns = Math.max(columns, 1)
  const cellSizePx = renderMetrics?.cellSizePx ?? 44
  const cellGapPx = renderMetrics?.cellGapPx ?? 8

  if (mode === 'empty') {
    return (
      <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8">
        <EmptyState compact title="Zona vacia" description="" />
      </div>
    )
  }

  return (
    <div>
      <div
        className="grid justify-start gap-2.5"
        style={{
          gap: `${cellGapPx}px`,
          gridTemplateColumns: `repeat(${safeColumns}, ${cellSizePx}px)`,
        }}
      >
        {slots.map((slot) => {
          const plantId = slot.plant?.id ?? null
          const isSelected = Array.isArray(selectedPlantIds)
            ? (plantId !== null && selectedPlantIds.includes(plantId))
            : plantId === selectedPlantId

          return (
            <PlantSlot
              key={slot.id}
              slot={slot}
              plant={slot.plant}
              empty={!slot.plant}
              selected={isSelected}
              selectedEmpty={slot.id === selectedSlotId}
              onClick={onPlantClick}
              onEmptyClick={onEmptySlotClick}
              selectedEmphasis={selectedEmphasis}
              renderMetrics={renderMetrics}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ZonePlantGrid
