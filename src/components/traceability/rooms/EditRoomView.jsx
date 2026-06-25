import { useCallback, useEffect, useState } from 'react'
import {
  createZone,
  deleteZoneIfEmpty,
  getBedsByRoom,
  getPlants,
  getRoomById,
  updateRoom,
  updateZone,
} from '../../../services/traceability.service'
import RoomFormView from './RoomFormView'

function EditRoomView({ roomId, onBack, onUpdated }) {
  const [room, setRoom] = useState(null)
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formVersion, setFormVersion] = useState(0)

  const refreshRoomEdition = useCallback(async (cancelled = false) => {
      setLoading(true)
      setError('')

      try {
        const [nextRoom, nextBeds, plants] = await Promise.all([
          getRoomById(roomId),
          getBedsByRoom(roomId),
          getPlants(),
        ])

        if (cancelled) {
          return
        }

        const plantsByBedId = plants.reduce((accumulator, plant) => {
          const bedId = plant.bedId

          if (!bedId) {
            return accumulator
          }

          if (!accumulator[bedId]) {
            accumulator[bedId] = []
          }

          accumulator[bedId].push(plant)
          return accumulator
        }, {})

        setRoom({
          id: nextRoom.id,
          name: nextRoom.name ?? '',
          type: nextRoom.type ?? '',
          description: nextRoom.description ?? '',
          status: nextRoom.status ?? 'activa',
          layout_width: nextRoom.layout_width ?? nextRoom.layout?.width ?? null,
          layout_height: nextRoom.layout_height ?? nextRoom.layout?.height ?? null,
        })
        setZones(
          nextBeds.map((bed) => {
            const zonePlants = plantsByBedId[bed.id] ?? []
            const positionedPlants = zonePlants.filter(
              (plant) => Number.isInteger(plant.row_index) && Number.isInteger(plant.column_index),
            )

            return {
              id: bed.id,
              code: bed.code ?? '',
              description: bed.description ?? '',
              row_count: Number(bed.row_count) || 1,
              column_count: Number(bed.column_count) || 1,
              status: bed.status ?? 'activa',
              capacity: Number(bed.capacity) || (Number(bed.row_count) || 1) * (Number(bed.column_count) || 1),
              plantCount: zonePlants.length,
              plants: zonePlants.map((plant) => ({
                id: plant.id,
                code: plant.code ?? 'Sin codigo',
                status: plant.status ?? 'Sin estado',
                strain: plant.strain ?? 'Sin genetica',
                rowIndex: Number.isInteger(plant.row_index) ? plant.row_index : null,
                columnIndex: Number.isInteger(plant.column_index) ? plant.column_index : null,
              })),
              maxOccupiedRow: positionedPlants.reduce(
                (highest, plant) => Math.max(highest, plant.row_index + 1),
                0,
              ),
              maxOccupiedColumn: positionedPlants.reduce(
                (highest, plant) => Math.max(highest, plant.column_index + 1),
                0,
              ),
              hasUnpositionedPlants: zonePlants.some(
                (plant) => !Number.isInteger(plant.row_index) || !Number.isInteger(plant.column_index),
              ),
              previous_row_count: Number(bed.row_count) || 1,
              previous_column_count: Number(bed.column_count) || 1,
              layout_x: bed.layout_x ?? bed.layout?.x ?? null,
              layout_y: bed.layout_y ?? bed.layout?.y ?? null,
              layout_width: bed.layout_width ?? bed.layout?.width ?? null,
              layout_height: bed.layout_height ?? bed.layout?.height ?? null,
            }
          }),
        )
        setFormVersion((current) => current + 1)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(loadError.message ?? 'No se pudo cargar la sala para editar.')
        setRoom(null)
        setZones([])
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
  }, [roomId])

  useEffect(() => {
    let cancelled = false
    const timeoutId = window.setTimeout(() => {
      refreshRoomEdition(cancelled)
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [refreshRoomEdition])

  async function handleSubmit({ room: nextRoom, zones: nextZones, deletedZoneIds }) {
    await updateRoom(nextRoom)

    const existingZones = nextZones.filter((zone) => zone.id)
    const newZones = nextZones.filter((zone) => !zone.id)

    for (const zone of existingZones) {
      await updateZone(zone)
    }

    for (const zone of newZones) {
      await createZone({
        room_id: roomId,
        code: zone.code,
        capacity: zone.capacity,
        row_count: zone.row_count,
        column_count: zone.column_count,
        status: zone.status,
        description: zone.description,
        layout_x: zone.layout_x ?? null,
        layout_y: zone.layout_y ?? null,
        layout_width: zone.layout_width ?? null,
        layout_height: zone.layout_height ?? null,
      })
    }

    for (const zoneId of deletedZoneIds) {
      await deleteZoneIfEmpty(zoneId)
    }

    await onUpdated?.(roomId)
  }

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        Cargando datos de la sala...
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-8 text-sm text-red-700">
        {error || 'No se pudo preparar la edicion de la sala.'}
      </div>
    )
  }

  return (
    <RoomFormView
      key={`edit-room-${room.id}-${formVersion}`}
      mode="edit"
      initialRoom={room}
      initialZones={zones}
      onSubmit={handleSubmit}
      onBack={onBack}
      onPlantCreated={refreshRoomEdition}
    />
  )
}

export default EditRoomView
