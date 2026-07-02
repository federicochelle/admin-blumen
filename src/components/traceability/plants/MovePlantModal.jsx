import { useEffect, useMemo, useState } from 'react'
import ZonePlantGrid from '../rooms/ZonePlantGrid'
import {
  getBedsByRoom,
  getPlants,
  getRooms,
  movePlant,
} from '../../../services/traceability.service'

function InlineFormMessage({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

function formatPosition(rowIndex, columnIndex) {
  if (!Number.isInteger(rowIndex) || !Number.isInteger(columnIndex)) {
    return 'Sin coordenadas'
  }

  return `Fila ${rowIndex + 1} / Columna ${columnIndex + 1}`
}

function formatLocationLabel(roomName, bedCode, position) {
  return `${roomName} / ${bedCode} (${position})`
}

function MovePlantModal({ open, plant, onClose, onMoved }) {
  const [rooms, setRooms] = useState([])
  const [beds, setBeds] = useState([])
  const [plants, setPlants] = useState([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedBedId, setSelectedBedId] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')

  function resetModalState() {
    setSelectedRoomId('')
    setSelectedBedId('')
    setSelectedSlot(null)
    setLoadError('')
    setSubmitError('')
  }

  function handleClose() {
    resetModalState()
    onClose?.()
  }

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function loadLocationOptions() {
      setLoading(true)
      setLoadError('')

      try {
        const nextRooms = await getRooms()
        const bedsByRoom = await Promise.all(nextRooms.map((room) => getBedsByRoom(room.id)))
        const nextBeds = bedsByRoom.flat()
        const nextPlants = await getPlants()

        if (cancelled) {
          return
        }

        setRooms(nextRooms)
        setBeds(nextBeds)
        setPlants(nextPlants)
      } catch (error) {
        if (cancelled) {
          return
        }

        setRooms([])
        setBeds([])
        setPlants([])
        setLoadError(error.message ?? 'No se pudo cargar el destino del movimiento.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLocationOptions()

    return () => {
      cancelled = true
    }
  }, [open])

  const availableBeds = useMemo(
    () => beds.filter((bed) => String(bed.room_id) === String(selectedRoomId)),
    [beds, selectedRoomId],
  )

  const selectedBed = useMemo(
    () => beds.find((bed) => String(bed.id) === String(selectedBedId)) ?? null,
    [beds, selectedBedId],
  )

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(selectedRoomId)) ?? null,
    [rooms, selectedRoomId],
  )

  const destinationZone = useMemo(() => {
    if (!selectedBed) {
      return null
    }

    const destinationPlants = plants
      .filter((candidate) => candidate.bedId === selectedBed.id)
      .map((candidate) => ({
        id: candidate.id,
        code: candidate.code ?? 'Sin codigo',
        status: candidate.status ?? 'Sin estado',
        stage: candidate.stage ?? 'Sin etapa',
        strain: candidate.strain ?? 'Sin genetica',
        rowIndex: Number.isInteger(candidate.row_index) ? candidate.row_index : null,
        columnIndex: Number.isInteger(candidate.column_index) ? candidate.column_index : null,
      }))

    return {
      id: selectedBed.id,
      code: selectedBed.code ?? selectedBed.name ?? 'Sin zona',
      rowCount: Number(selectedBed.row_count) || 0,
      columnCount: Number(selectedBed.column_count) || 0,
      visualCapacity:
        (Number(selectedBed.row_count) || 0) * (Number(selectedBed.column_count) || 0) ||
        Number(selectedBed.capacity) ||
        0,
      plants: destinationPlants,
    }
  }, [plants, selectedBed])

  if (!plant) {
    return null
  }

  const originRoom = plant.room ?? 'Sin sala'
  const originBed = plant.bed ?? 'Sin zona'
  const originPosition = formatPosition(plant.rowIndex, plant.columnIndex)
  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!selectedRoom || !selectedBed || !selectedSlot) {
      setSubmitError('Selecciona sala, zona y slot de destino.')
      return
    }

    setSaving(true)

    const originLabel = formatLocationLabel(originRoom, originBed, originPosition)
    const destinationLabel = formatLocationLabel(
      selectedRoom.name ?? 'Sin sala',
      selectedBed.code ?? 'Sin zona',
      formatPosition(selectedSlot.rowIndex, selectedSlot.columnIndex),
    )
    const payload = {
      plant_id: plant.id,
      from_bed_id: plant.bedId,
      from_row_index: plant.rowIndex,
      from_column_index: plant.columnIndex,
      to_bed_id: selectedBed.id,
      to_row_index: selectedSlot.rowIndex,
      to_column_index: selectedSlot.columnIndex,
      event_date: new Date().toISOString(),
      description: `La planta ${plant.code ?? 'sin código'} fue movida desde ${originLabel} hacia ${destinationLabel}.`,
    }

    console.log('move payload', payload)

    try {
      const result = await movePlant(payload)

      window.alert(
        result?.floweringStarted
          ? 'Planta movida. Inicio de floración registrado.'
          : 'Planta movida.',
      )

      await onMoved?.()
      handleClose()
    } catch (error) {
      setSubmitError(error.message ?? 'No se pudo mover la planta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar modal de movimiento"
        onClick={handleClose}
        className={`fixed inset-0 z-[60] bg-slate-950/30 transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <section className="w-full max-w-4xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Movimiento de planta
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                {plant.code ?? 'Planta'}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/55 bg-brand-deep-purple text-white transition hover:border-brand-deeper-purple hover:bg-brand-deeper-purple"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-4">
                <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Origen actual
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-slate-500">Sala</p>
                        <p className="font-semibold text-slate-950">{originRoom}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Zona</p>
                        <p className="font-semibold text-slate-950">{originBed}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500">Posicion</p>
                      <p className="font-semibold text-slate-950">{originPosition}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Destino de la planta
                  </p>

                  <div className="mt-4 space-y-3">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Sala destino</span>
                      <select
                        value={selectedRoomId}
                        onChange={(event) => {
                          setSelectedRoomId(event.target.value)
                          setSelectedBedId('')
                          setSelectedSlot(null)
                        }}
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        <option value="">{loading ? 'Cargando salas...' : 'Selecciona una sala'}</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">Zona destino</span>
                      <select
                        value={selectedBedId}
                        onChange={(event) => {
                          setSelectedBedId(event.target.value)
                          setSelectedSlot(null)
                        }}
                        disabled={!selectedRoomId || loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                      >
                        <option value="">
                          {!selectedRoomId ? 'Selecciona primero una sala' : 'Selecciona una zona'}
                        </option>
                        {availableBeds.map((bed) => (
                          <option key={bed.id} value={bed.id}>
                            {bed.code ?? bed.name ?? 'Sin zona'}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                </section>
              </div>

              <section className="rounded-[1.5rem] border border-slate-200 bg-[#f7f5f1] p-4">
                <div>
                  {destinationZone ? (
                    <ZonePlantGrid
                      zone={destinationZone}
                      selectedSlotId={selectedSlot?.id ?? null}
                      onEmptySlotClick={setSelectedSlot}
                    />
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
                      Selecciona sala y zona para ver los slots disponibles.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <InlineFormMessage message={loadError || submitError} />

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Moviendo...' : 'Confirmar movimiento'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default MovePlantModal
