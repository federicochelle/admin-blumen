import { useMemo, useState } from 'react'
import FilterBar from '../../shared/FilterBar'
import PlantDetailView from '../plants/PlantDetailView'
import PlantTable from '../plants/PlantTable'

function TraceabilityPlantsView({
  plants,
  selectedPlantId,
  onSelectPlant,
  onDataChanged,
  onDeleted,
  viewMode = 'list',
  onNavigateList,
  onNavigateDetail,
  onOpenRoomDetail,
  loading,
}) {
  const [query, setQuery] = useState('')

  const filteredPlants = plants.filter((plant) => {
    const haystack = [
      plant.code,
      plant.strain,
      plant.room,
      plant.bed,
      plant.batchCode,
      plant.batchName,
      plant.stage,
      plant.status,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query.toLowerCase())
  })

  const selectedPlant = useMemo(
    () => plants.find((plant) => plant.id === selectedPlantId) ?? null,
    [plants, selectedPlantId],
  )

  function handleSelectPlant(plant) {
    onSelectPlant(plant.id)
    onNavigateDetail?.(plant.id)
  }

  function handleBackToList() {
    onNavigateList?.()
  }

  return (
    <section className="space-y-5">
      {loading ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
          Cargando plantas, eventos y riegos...
        </div>
      ) : viewMode === 'detail' && selectedPlant ? (
        <PlantDetailView
          plant={selectedPlant}
          onDataChanged={onDataChanged}
          onOpenRoomDetail={onOpenRoomDetail}
          onDeleted={onDeleted}
          onBack={handleBackToList}
        />
      ) : (
        <div className="min-w-0 rounded-[1.9rem] bg-slate-50/80">
          <PlantTable
            plants={filteredPlants}
            selectedPlantId={selectedPlantId}
            onSelectPlant={handleSelectPlant}
            filterBar={
              <FilterBar
                value={query}
                onChange={setQuery}
                placeholder="Filtrar por codigo, genetica, sala o zona"
                summary={`${filteredPlants.length} plantas encontradas`}
              />
            }
          />
        </div>
      )}
    </section>
  )
}

export default TraceabilityPlantsView
