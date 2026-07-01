import EditPlantModal from './EditPlantModal'
import MovePlantModal from './MovePlantModal'
import { useState } from 'react'
import ZonePlantGrid from '../rooms/ZonePlantGrid'
import PlantEventDetailModal from './PlantEventDetailModal'
import PlantEventsHistory from './PlantEventsHistory'
import PlantRecordModals from './PlantRecordModals'
import PlantVisualTimeline from './PlantVisualTimeline'
import { deletePlant } from '../../../services/traceability.service'

function ActionButton({
  label,
  onClick,
  tone = 'default',
  disabled = false,
  title = undefined,
  icon,
}) {
  const tones = {
    default:
      'border-brand-deep-purple bg-brand-deep-purple text-white hover:border-brand-deeper-purple hover:bg-brand-deeper-purple',
    primary:
      'border-brand-turquoise bg-brand-turquoise text-white hover:border-brand-deep-purple hover:bg-brand-deep-purple',
    secondary:
      'border-brand-lavender bg-brand-light-lilac text-brand-deep-purple hover:border-brand-deep-purple hover:bg-brand-lavender/30',
    destructive:
      'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${
        disabled
          ? 'cursor-not-allowed border-brand-lavender/45 bg-brand-light-lilac/55 text-brand-deep-purple/55'
          : tones[tone]
      }`}
      aria-label={label}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function SurfaceCard({ title, subtitle = null, children }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      {title ? (
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

function PlantDetailView({ plant, onDataChanged, onOpenRoomDetail, onDeleted }) {
  const [showEventForm, setShowEventForm] = useState(false)
  const [showIrrigationForm, setShowIrrigationForm] = useState(false)
  const [showObservationForm, setShowObservationForm] = useState(false)
  const [showMovePlantModal, setShowMovePlantModal] = useState(false)
  const [showEditPlantModal, setShowEditPlantModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [deletingPlant, setDeletingPlant] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleEventDeleted() {
    setSelectedEvent(null)
    await onDataChanged?.()
  }

  async function handleDeletePlant() {
    if (!plant?.id || deletingPlant) {
      return
    }

    const confirmed = window.confirm(
      '¿Eliminar esta planta? Esta acción borrará también sus eventos y no se puede deshacer.',
    )

    if (!confirmed) {
      return
    }

    setDeleteError('')
    setDeletingPlant(true)

    try {
      await deletePlant(plant.id)
      await onDeleted?.(plant)
    } catch (error) {
      setDeleteError(error.message ?? 'No se pudo eliminar la planta.')
    } finally {
      setDeletingPlant(false)
    }
  }

  return (
    <section className="space-y-5">
      <section className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Ficha de planta
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {plant.code}
              </h1>
              <p className="mt-2 text-base font-semibold text-brand-deeper-purple">
                {plant.batchLabel ?? 'Sin lote'}
              </p>
              <p className="mt-1 text-lg text-slate-600">{plant.strain}</p>
            </div>
          </div>

          <div className="space-y-4 lg:min-w-[340px]">
            {deleteError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="flex flex-row flex-wrap gap-3 lg:justify-end">
              <ActionButton
                label="Evento"
                tone="primary"
                onClick={() => setShowEventForm(true)}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                }
              />
              <ActionButton
                label="Mover"
                tone="secondary"
                onClick={() => setShowMovePlantModal(true)}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M8 7h9" />
                    <path d="m13 3 4 4-4 4" />
                    <path d="M16 17H7" />
                    <path d="m11 13-4 4 4 4" />
                  </svg>
                }
              />
              <ActionButton
                label="Editar"
                tone="default"
                onClick={() => setShowEditPlantModal(true)}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
                    <path d="M13.5 6.5l4 4" />
                  </svg>
                }
              />
              <ActionButton
                label={deletingPlant ? 'Eliminando...' : 'Eliminar'}
                tone="destructive"
                onClick={handleDeletePlant}
                disabled={deletingPlant}
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7h16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                }
              />
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-[#f7f5f1] px-4 py-3">
              <PlantVisualTimeline
                events={plant.events}
                layout="horizontal-compact"
                title="Edad"
                value={plant.ageLabel ?? '—'}
              />
            </div>

            {plant.location ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-[#f7f5f1] px-4 py-3">
                <div className="mb-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Sala
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{plant.room}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Ubicación
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">{plant.bed}</p>
                  </div>

                  {plant.roomId ? (
                    <button
                      type="button"
                      onClick={() => onOpenRoomDetail?.(plant.roomId)}
                      className="self-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    >
                      Ver sala
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                <ZonePlantGrid
                  zone={plant.location}
                  selectedPlantId={plant.id}
                  selectedEmphasis="strong"
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SurfaceCard title="Historial de eventos">
        <div className="max-h-[32rem] overflow-y-auto pr-1">
          <PlantEventsHistory
            events={plant.events}
            onRegisterFirstEvent={() => setShowEventForm(true)}
            onEventDeleted={handleEventDeleted}
            onEventSelected={setSelectedEvent}
          />
        </div>
      </SurfaceCard>

      <PlantRecordModals
        plant={plant}
        onDataChanged={onDataChanged}
        showEventForm={showEventForm}
        setShowEventForm={setShowEventForm}
        showIrrigationForm={showIrrigationForm}
        setShowIrrigationForm={setShowIrrigationForm}
        showObservationForm={showObservationForm}
        setShowObservationForm={setShowObservationForm}
      />

      <MovePlantModal
        open={showMovePlantModal}
        plant={plant}
        onClose={() => setShowMovePlantModal(false)}
        onMoved={onDataChanged}
      />

      {showEditPlantModal ? (
        <EditPlantModal
          open={showEditPlantModal}
          plant={plant}
          onClose={() => setShowEditPlantModal(false)}
          onUpdated={onDataChanged}
        />
      ) : null}

      <PlantEventDetailModal
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  )
}

export default PlantDetailView
