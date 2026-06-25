import { useNavigate, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../components/shared/Breadcrumbs'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import PlantDetailView from '../components/traceability/plants/PlantDetailView'
import TraceabilityRoomsView from '../components/traceability/views/TraceabilityRoomsView'
import { useTraceabilityData } from '../hooks/useTraceabilityData'

function Rooms() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { traceability, loading, error, loadTraceability } = useTraceabilityData()

  const viewMode = searchParams.get('view') ?? 'list'
  const selectedRoomIdParam = searchParams.get('room')
  const selectedPlantIdParam = searchParams.get('plant')
  const selectedRoomId = selectedRoomIdParam ? Number(selectedRoomIdParam) : null
  const selectedPlantId = selectedPlantIdParam ? Number(selectedPlantIdParam) : null

  const selectedRoom =
    traceability.roomSummaries.find((room) => room.id === selectedRoomId) ?? null
  const selectedRoomBeds = traceability.roomBeds.filter((bed) => bed.roomId === selectedRoomId)
  const selectedPlant =
    traceability.plantRows.find((plant) => plant.id === selectedPlantId) ?? null

  function navigateToList() {
    navigate('/salas')
  }

  function navigateToDetail(roomId) {
    navigate(`/salas?view=detail&room=${roomId}`)
  }

  function navigateToEdit(roomId) {
    navigate(`/salas?view=edit&room=${roomId}`)
  }

  function navigateToCreate() {
    navigate('/salas?view=create')
  }

  function handleOpenPlantDetail(plantId) {
    if (selectedRoomId) {
      navigate(`/salas?view=plant&room=${selectedRoomId}&plant=${plantId}`)
      return
    }

    navigate(`/plantas?view=detail&plant=${plantId}`)
  }

  let breadcrumbItems = [{ label: 'Salas' }]

  if (viewMode === 'detail' && selectedRoom) {
    breadcrumbItems = [
      { label: 'Salas', onClick: navigateToList },
      { label: selectedRoom.name },
    ]
  } else if (viewMode === 'plant' && selectedRoom && selectedPlant) {
    breadcrumbItems = [
      { label: 'Salas', onClick: navigateToList },
      { label: selectedRoom.name, onClick: () => navigateToDetail(selectedRoom.id) },
      { label: selectedPlant.code ?? 'Planta' },
    ]
  } else if (viewMode === 'edit' && selectedRoom) {
    breadcrumbItems = [
      { label: 'Salas', onClick: navigateToList },
      { label: selectedRoom.name, onClick: () => navigateToDetail(selectedRoom.id) },
      { label: 'Editar' },
    ]
  } else if (viewMode === 'create') {
    breadcrumbItems = [
      { label: 'Salas', onClick: navigateToList },
      { label: 'Crear sala' },
    ]
  }

  return (
    <div>
      <PageHeader>
        <Breadcrumbs items={breadcrumbItems} />
      </PageHeader>

      {error ? (
        <EmptyState title="No se pudo cargar salas" description={error} />
      ) : viewMode === 'plant' && selectedPlant ? (
        <PlantDetailView
          plant={selectedPlant}
          onDataChanged={loadTraceability}
          onOpenRoomDetail={navigateToDetail}
        />
      ) : (
        <TraceabilityRoomsView
          rooms={traceability.roomSummaries}
          selectedRoom={selectedRoom}
          selectedRoomId={selectedRoomId}
          roomBeds={selectedRoomBeds}
          plants={traceability.plantRows}
          onSelectRoom={() => {}}
          onRefreshRooms={loadTraceability}
          onOpenPlantDetail={handleOpenPlantDetail}
          viewMode={viewMode}
          onNavigateList={navigateToList}
          onNavigateDetail={navigateToDetail}
          onNavigateEdit={navigateToEdit}
          onNavigateCreate={navigateToCreate}
          loading={loading}
        />
      )}
    </div>
  )
}

export default Rooms
