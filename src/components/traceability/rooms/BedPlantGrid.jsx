import EmptyState from '../../shared/EmptyState'
import PlantSlot from './PlantSlot'

function BedPlantGrid({ bed }) {
  const plants = bed.plants ?? []
  const capacity = Number(bed.capacity) || 0

  if (plants.length === 0) {
    return (
      <div className="rounded-[1.1rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <EmptyState compact title="Zona vacia" description="" />
      </div>
    )
  }

  const slots =
    capacity > 0
      ? Array.from({ length: capacity }, (_, index) => ({
          id: `slot-${bed.id}-${index}`,
          plant: plants[index] ?? null,
        }))
      : plants.map((plant) => ({
          id: plant.id,
          plant,
        }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Mapa de plantas
        </p>
        <p className="text-xs text-slate-500">
          {plants.length}
          {capacity > 0 ? ` / ${capacity}` : ''} plantas
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <PlantSlot key={slot.id} plant={slot.plant} empty={!slot.plant} />
        ))}
      </div>
    </div>
  )
}

export default BedPlantGrid
