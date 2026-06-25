import EmptyState from '../../shared/EmptyState'
import PlantTableRow from './PlantTableRow'

function PlantTable({ plants, selectedPlantId, onSelectPlant, filterBar = null }) {
  if (plants.length === 0) {
    return (
      <EmptyState
        title="No hay plantas registradas"
        description="Cuando existan plantas conectadas a sus salas y zonas apareceran en esta tabla."
      />
    )
  }

  return (
    <section className="rounded-[1.5rem] border border-brand-light-lilac/40 bg-white/85 p-4 shadow-[0_12px_30px_rgba(91,70,111,0.08)] sm:p-5">
      {filterBar ? <div className="border-b border-brand-light-lilac/35 pb-4">{filterBar}</div> : null}

      <div className={`overflow-x-auto ${filterBar ? 'mt-4' : ''}`}>
        <div className="min-w-[780px] space-y-2">
          <div className="grid grid-cols-[1.85fr_1fr_0.95fr_0.95fr_0.9fr] gap-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <span>Planta</span>
            <span>Sala</span>
            <span>Zona</span>
            <span>Etapa</span>
            <span>Edad</span>
          </div>

          <div className="space-y-2">
            {plants.map((plant) => (
              <PlantTableRow
                key={plant.id}
                plant={plant}
                selected={plant.id === selectedPlantId}
                onSelect={onSelectPlant}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlantTable
