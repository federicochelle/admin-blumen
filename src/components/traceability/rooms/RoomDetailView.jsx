import { useMemo, useState } from 'react'
import { deleteRoomIfEmpty } from '../../../services/traceability.service'
import NewPlantModal from '../plants/NewPlantModal'
import PlantQuickViewDrawer from '../plants/PlantQuickViewDrawer'
import RoomBedsOverview from './RoomBedsOverview'
import RoomDetailHeader from './RoomDetailHeader'
import RoomEventModal from './RoomEventModal'
import RoomEventsHistory from './RoomEventsHistory'

function RoomDetailView({ room, beds, plants, onDataChanged, onOpenPlantDetail, onEditRoom, onRoomDeleted }) {
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [isPlantDrawerOpen, setIsPlantDrawerOpen] = useState(false)
  const [selectedEmptySlot, setSelectedEmptySlot] = useState(null)
  const [isNewPlantModalOpen, setIsNewPlantModalOpen] = useState(false)
  const [isZoneEventModalOpen, setIsZoneEventModalOpen] = useState(false)
  const [deletingRoom, setDeletingRoom] = useState(false)
  const [roomActionError, setRoomActionError] = useState('')

  const selectedPlantData = useMemo(() => {
    if (!selectedPlant?.id) {
      return null
    }

    return plants.find((plant) => plant.id === selectedPlant.id) ?? selectedPlant
  }, [plants, selectedPlant])

  const roomEvents = room?.roomEvents ?? []

  function handlePlantClick(plant) {
    setSelectedPlant(plant)
    setIsPlantDrawerOpen(true)
  }

  function handleCloseDrawer() {
    setIsPlantDrawerOpen(false)
    setSelectedPlant(null)
  }

  function handleEmptySlotClick(slot) {
    setSelectedEmptySlot(slot)
    setIsNewPlantModalOpen(true)
  }

  function handleCloseNewPlantModal() {
    setIsNewPlantModalOpen(false)
    setSelectedEmptySlot(null)
  }

  async function handlePlantCreated() {
    await onDataChanged?.(room.id)
  }

  async function handleDeleteRoom() {
    if (!room?.id) {
      return
    }

    const confirmed = window.confirm(`¿Eliminar la sala ${room.name}?`)

    if (!confirmed) {
      return
    }

    setRoomActionError('')
    setDeletingRoom(true)

    try {
      await deleteRoomIfEmpty(room.id)
      await onRoomDeleted?.(room.id)
    } catch (error) {
      setRoomActionError(error.message ?? 'No se pudo eliminar la sala.')
    } finally {
      setDeletingRoom(false)
    }
  }

  return (
      <>
      <div className="space-y-5">
        <RoomDetailHeader
          room={room}
          onEditRoom={() => onEditRoom?.(room.id)}
          onDeleteRoom={handleDeleteRoom}
          deleting={deletingRoom}
        />
        {roomActionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {roomActionError}
          </div>
        ) : null}
        <section className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Distribucion de la sala
            </p>
          </div>
          <RoomBedsOverview
            room={room}
            beds={beds}
            selectedPlantId={selectedPlantData?.id ?? null}
            onPlantClick={handlePlantClick}
            onEmptySlotClick={handleEmptySlotClick}
            useLayoutCanvas={false}
            editable={false}
            showCount={false}
            embedded
          />
        </section>
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Historial de eventos de sala
            </p>
            <button
              type="button"
              onClick={() => setIsZoneEventModalOpen(true)}
              className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple"
            >
              Registrar evento
            </button>
          </div>
          <RoomEventsHistory events={roomEvents} onEventDeleted={onDataChanged} />
        </section>
      </div>

      <PlantQuickViewDrawer
        plant={selectedPlantData}
        open={isPlantDrawerOpen}
        onClose={handleCloseDrawer}
        onDataChanged={onDataChanged}
        onOpenPlantDetail={onOpenPlantDetail}
      />

      <NewPlantModal
        open={isNewPlantModalOpen}
        slot={selectedEmptySlot}
        onClose={handleCloseNewPlantModal}
        onCreated={handlePlantCreated}
      />

      <RoomEventModal
        open={isZoneEventModalOpen}
        room={room}
        onClose={() => setIsZoneEventModalOpen(false)}
        onCreated={onDataChanged}
      />
    </>
  )
}

export default RoomDetailView
