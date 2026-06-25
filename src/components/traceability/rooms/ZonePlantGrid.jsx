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
  selectedSlotId = null,
  onPlantClick,
  onEmptySlotClick,
  selectedEmphasis = 'default',
}) {
  const { slots, columns, mode } = buildZoneSlots(zone)
  const safeColumns = Math.max(columns, 1)
  const slotSize =
    safeColumns <= 2
      ? 'clamp(3.3rem, 5vw, 4.4rem)'
      : safeColumns <= 4
        ? 'clamp(2.8rem, 4vw, 3.8rem)'
        : 'clamp(2.35rem, 3vw, 3.2rem)'

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
          gridTemplateColumns: `repeat(${safeColumns}, minmax(0, var(--slot-size)))`,
          ['--slot-size']: slotSize,
        }}
      >
        {slots.map((slot) => (
          <PlantSlot
            key={slot.id}
            slot={slot}
            plant={slot.plant}
            empty={!slot.plant}
            selected={slot.plant?.id === selectedPlantId}
            selectedEmpty={slot.id === selectedSlotId}
            onClick={onPlantClick}
            onEmptyClick={onEmptySlotClick}
            selectedEmphasis={selectedEmphasis}
          />
        ))}
      </div>
    </div>
  )
}

export default ZonePlantGrid
