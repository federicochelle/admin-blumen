import { useNavigate, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../components/shared/Breadcrumbs'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import TraceabilityPlantsView from '../components/traceability/views/TraceabilityPlantsView'
import { useTraceabilityData } from '../hooks/useTraceabilityData'

function Plants() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { traceability, loading, error, loadTraceability } = useTraceabilityData()

  const viewMode = searchParams.get('view') ?? 'list'
  const selectedPlantIdParam = searchParams.get('plant')
  const sourceRoomIdParam = searchParams.get('room')
  const selectedPlantId = selectedPlantIdParam ? Number(selectedPlantIdParam) : null
  const sourceRoomId = sourceRoomIdParam ? Number(sourceRoomIdParam) : null
  const selectedPlant =
    traceability.plantRows.find((plant) => plant.id === selectedPlantId) ?? null
  const sourceRoom =
    traceability.roomSummaries.find((room) => room.id === sourceRoomId) ?? null

  function navigateToList() {
    navigate('/plantas')
  }

  function navigateToDetail(plantId) {
    navigate(`/plantas?view=detail&plant=${plantId}`)
  }

  function handleOpenRoomDetail(roomId) {
    navigate(`/salas?view=detail&room=${roomId}`)
  }

  async function handlePlantDeleted(deletedPlant) {
    await loadTraceability()

    if (sourceRoom?.id) {
      navigate(`/salas?view=detail&room=${sourceRoom.id}`)
      return
    }

    if (deletedPlant?.roomId) {
      navigate(`/salas?view=detail&room=${deletedPlant.roomId}`)
      return
    }

    navigateToList()
  }

  const breadcrumbItems =
    viewMode === 'detail' && selectedPlant && sourceRoom
      ? [
          { label: 'Salas', onClick: () => navigate('/salas') },
          { label: sourceRoom.name, onClick: () => navigate(`/salas?view=detail&room=${sourceRoom.id}`) },
          { label: selectedPlant.code ?? 'Planta' },
        ]
      : viewMode === 'detail' && selectedPlant
        ? [
            { label: 'Plantas', onClick: navigateToList },
            { label: selectedPlant.code ?? 'Planta' },
          ]
        : [{ label: 'Plantas' }]

  return (
    <div>
      <PageHeader>
        <Breadcrumbs items={breadcrumbItems} />
      </PageHeader>

      {error ? (
        <EmptyState title="No se pudo cargar plantas" description={error} />
      ) : (
        <TraceabilityPlantsView
          plants={traceability.plantRows}
          selectedPlantId={selectedPlantId}
          onSelectPlant={() => {}}
          onDataChanged={loadTraceability}
          onDeleted={handlePlantDeleted}
          viewMode={viewMode}
          onNavigateList={navigateToList}
          onNavigateDetail={navigateToDetail}
          onOpenRoomDetail={handleOpenRoomDetail}
          loading={loading}
        />
      )}
    </div>
  )
}

export default Plants
