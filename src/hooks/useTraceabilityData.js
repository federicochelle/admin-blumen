import { useCallback, useEffect, useState } from 'react'
import { buildTraceabilityModel } from '../services/traceability.adapters'
import {
  getAllIrrigations,
  getAllPlantEvents,
  getBedsByRoom,
  getPlants,
  getRoomEvents,
  getRooms,
} from '../services/traceability.service'

const emptyTraceability = {
  overview: {
    totalRooms: 0,
    totalBeds: 0,
    totalPlants: 0,
    totalEvents: 0,
    totalIrrigations: 0,
  },
  overviewDashboard: {
    kpis: {
      totalRooms: 0,
      totalBeds: 0,
      totalPlants: 0,
      totalEvents: 0,
      totalIrrigations: 0,
    },
    plantsByStage: [],
    roomOccupancy: [],
    recentEvents: [],
    recentIrrigations: [],
    alerts: [],
  },
  roomSummaries: [],
  roomBeds: [],
  plantRows: [],
}

export function useTraceabilityData() {
  const [traceability, setTraceability] = useState(emptyTraceability)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTraceability = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [rooms, plants, plantEvents, roomEvents, irrigations] = await Promise.all([
        getRooms(),
        getPlants(),
        getAllPlantEvents(),
        getRoomEvents(),
        getAllIrrigations(),
      ])

      const bedsByRoom = await Promise.all(rooms.map((room) => getBedsByRoom(room.id)))
      const beds = bedsByRoom.flat()

      setTraceability(
        buildTraceabilityModel({
          rooms,
          beds,
          plants,
          plantEvents,
          roomEvents,
          irrigations,
        }),
      )
    } catch (loadError) {
      setError(loadError.message ?? 'No se pudo cargar la trazabilidad.')
      setTraceability(emptyTraceability)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialTraceability() {
      setLoading(true)
      setError('')

      try {
        const [rooms, plants, plantEvents, roomEvents, irrigations] = await Promise.all([
          getRooms(),
          getPlants(),
          getAllPlantEvents(),
          getRoomEvents(),
          getAllIrrigations(),
        ])

        const bedsByRoom = await Promise.all(rooms.map((room) => getBedsByRoom(room.id)))
        const beds = bedsByRoom.flat()
        const nextModel = buildTraceabilityModel({
          rooms,
          beds,
          plants,
          plantEvents,
          roomEvents,
          irrigations,
        })

        if (cancelled) {
          return
        }

        setTraceability(nextModel)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(loadError.message ?? 'No se pudo cargar la trazabilidad.')
        setTraceability(emptyTraceability)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialTraceability()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    traceability,
    loading,
    error,
    loadTraceability,
  }
}
