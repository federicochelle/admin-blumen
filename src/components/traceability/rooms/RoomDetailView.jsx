import { useMemo, useState } from 'react'
import { deleteRoomIfEmpty } from '../../../services/traceability.service'
import NewPlantModal from '../plants/NewPlantModal'
import PlantQuickViewDrawer from '../plants/PlantQuickViewDrawer'
import RoomBedsOverview from './RoomBedsOverview'
import RoomDetailHeader from './RoomDetailHeader'
import RoomEventModal from './RoomEventModal'
import RoomEventsHistory from './RoomEventsHistory'

function normalizeComparableText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function isFloweringRoomType(value) {
  return normalizeComparableText(value).includes('flor')
}

function isFloweringEventType(value) {
  return ['floracion', 'cambio_etapa', 'inicio_floracion'].includes(normalizeComparableText(value))
}

function getFirstFloweringEvent(plant) {
  const floweringEvents = (plant?.events ?? [])
    .filter((event) => isFloweringEventType(event?.event_type ?? event?.type))
    .sort((left, right) => new Date(left?.event_date ?? left?.date ?? 0) - new Date(right?.event_date ?? right?.date ?? 0))

  return floweringEvents[0] ?? null
}

function getDayCountFromDate(value) {
  if (!value) {
    return null
  }

  const startDate = new Date(value)

  if (Number.isNaN(startDate.getTime())) {
    return null
  }

  const today = new Date()
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffInMilliseconds = currentDay.getTime() - startDay.getTime()

  if (diffInMilliseconds < 0) {
    return null
  }

  return Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)) + 1
}

function formatFloweringStartDate(value) {
  if (!value) {
    return 'Sin fecha'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

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
  const currentRoomPlants = useMemo(
    () => plants.filter((plant) => String(plant.roomId ?? '') === String(room?.id ?? '')),
    [plants, room?.id],
  )
  const isFloweringRoom = isFloweringRoomType(room?.type)
  const floweringSummary = useMemo(() => {
    const groupsByBatchKey = new Map()
    let plantsWithoutFlowering = 0

    currentRoomPlants.forEach((plant) => {
      const firstFloweringEvent = getFirstFloweringEvent(plant)

      if (!firstFloweringEvent?.event_date) {
        plantsWithoutFlowering += 1
        return
      }

      const batchKey = plant.batchId ? `batch:${plant.batchId}` : 'batch:none'
      const batchLabel = plant.batchLabel ?? 'Sin lote'
      const eventDate = firstFloweringEvent.event_date
      const existingGroup = groupsByBatchKey.get(batchKey)

      if (!existingGroup) {
        groupsByBatchKey.set(batchKey, {
          key: batchKey,
          label: batchLabel,
          plantCount: 1,
          oldestStartDate: eventDate,
          latestStartDate: eventDate,
        })
        return
      }

      existingGroup.plantCount += 1

      if (new Date(eventDate) < new Date(existingGroup.oldestStartDate)) {
        existingGroup.oldestStartDate = eventDate
      }

      if (new Date(eventDate) > new Date(existingGroup.latestStartDate)) {
        existingGroup.latestStartDate = eventDate
      }
    })

    const groups = Array.from(groupsByBatchKey.values())
      .map((group) => ({
        ...group,
        dayCount: getDayCountFromDate(group.oldestStartDate),
        hasMixedDates:
          String(group.oldestStartDate ?? '') !== String(group.latestStartDate ?? ''),
      }))
      .sort((left, right) => new Date(left.oldestStartDate) - new Date(right.oldestStartDate))

    return {
      groups,
      plantsWithoutFlowering,
    }
  }, [currentRoomPlants])

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
        {isFloweringRoom ? (
          <section className="rounded-[1.5rem] border border-violet-200 bg-violet-50/60 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-700">
                  Días en floración
                </p>
              </div>

              {floweringSummary.groups.length > 0 ? (
                <div className="space-y-2.5">
                  {floweringSummary.groups.map((group) => (
                    <article
                      key={group.key}
                      className="rounded-[1.1rem] border border-violet-200 bg-white/90 px-4 py-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Lote
                          </p>
                          <p className="text-sm font-semibold text-slate-950">{group.label}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Plantas
                          </p>
                          <p className="text-sm font-semibold text-slate-950">{group.plantCount}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Inicio
                          </p>
                          <p className="text-sm font-semibold text-slate-950">
                            {formatFloweringStartDate(group.oldestStartDate)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                            Día
                          </p>
                          <p className="text-sm font-semibold text-slate-950">{group.dayCount ?? '—'}</p>
                        </div>
                      </div>
                      {group.hasMixedDates ? (
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-violet-700">
                          Fechas mixtas
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.1rem] border border-dashed border-violet-200 bg-white/80 px-4 py-4 text-sm text-slate-500">
                  No hay plantas con inicio de floración registrado en esta sala.
                </div>
              )}

              {floweringSummary.plantsWithoutFlowering > 0 ? (
                <div className="rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Hay {floweringSummary.plantsWithoutFlowering} plantas sin inicio de floración registrado.
                </div>
              ) : null}
            </div>
          </section>
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
