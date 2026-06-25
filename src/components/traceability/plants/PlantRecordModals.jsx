import { useState } from 'react'
import {
  appendPlantObservation,
  createIrrigation,
  createPlantEvent,
  updatePlant,
} from '../../../services/traceability.service'
import { MANUAL_PLANT_EVENT_TYPES } from '../../../constants/plantEventTypes'
import EventFormRenderer from './events/EventFormRenderer'
import {
  buildPlantEventPayload,
  createInitialEventFormValues,
  getStageUpdateForEventType,
  validateEventForm,
} from './events/eventFormUtils'

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

function FormModal({ open, title, onClose, children }) {
  return (
    <>
      <button
        type="button"
        aria-label={`Cerrar modal ${title}`}
        onClick={onClose}
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
        <section className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                {title}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/55 bg-brand-deep-purple text-white transition hover:border-brand-deeper-purple hover:bg-brand-deeper-purple"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-5">{children}</div>
        </section>
      </div>
    </>
  )
}

function PlantRecordModals({
  plant,
  onDataChanged,
  showEventForm,
  setShowEventForm,
  showIrrigationForm,
  setShowIrrigationForm,
  showObservationForm,
  setShowObservationForm,
}) {
  const [eventType, setEventType] = useState('')
  const [eventValues, setEventValues] = useState(() => createInitialEventFormValues())
  const [irrigationForm, setIrrigationForm] = useState({
    irrigation_date: '',
    liters: '',
    ph: '',
    ec: '',
    temperature: '',
    humidity: '',
    notes: '',
  })
  const [observationForm, setObservationForm] = useState({
    notes: '',
  })
  const [savingEvent, setSavingEvent] = useState(false)
  const [savingIrrigation, setSavingIrrigation] = useState(false)
  const [savingObservation, setSavingObservation] = useState(false)
  const [eventError, setEventError] = useState('')
  const [irrigationError, setIrrigationError] = useState('')
  const [observationError, setObservationError] = useState('')

  async function handleEventSubmit(event) {
    event.preventDefault()
    setEventError('')

    const validationError = validateEventForm(eventType, eventValues)

    if (validationError) {
      setEventError(validationError)
      return
    }

    setSavingEvent(true)
    const previousStage = plant.stageValue ?? null

    try {
      const payload = buildPlantEventPayload(eventType, eventValues)
      const nextStage = getStageUpdateForEventType(eventType)

      if (nextStage) {
        await updatePlant({
          id: plant.id,
          stage: nextStage,
        })
      }

      await createPlantEvent({
        plant_id: plant.id,
        event_type: eventType.trim(),
        event_date: payload.event_date,
        description: payload.description,
        event_data: payload.event_data,
        created_by: 'admin',
      })

      await onDataChanged?.()
      setEventType('')
      setEventValues(createInitialEventFormValues())
      setShowEventForm(false)
    } catch (error) {
      if (previousStage && getStageUpdateForEventType(eventType)) {
        try {
          await updatePlant({
            id: plant.id,
            stage: previousStage,
          })
        } catch {
          // Ignore rollback failures in UI layer; createPlantEvent already surfaced the main issue.
        }
      }
      setEventError(error.message ?? 'No se pudo guardar el evento.')
    } finally {
      setSavingEvent(false)
    }
  }

  function handleEventValueChange(field, value) {
    setEventValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const availableEventTypes = MANUAL_PLANT_EVENT_TYPES

  async function handleIrrigationSubmit(event) {
    event.preventDefault()
    setIrrigationError('')

    if (!plant.bedId) {
      setIrrigationError('Esta planta no tiene una zona asociada para registrar fertilización.')
      return
    }

    if (!irrigationForm.irrigation_date) {
      setIrrigationError('Completa la fecha de la fertilización.')
      return
    }

    setSavingIrrigation(true)

    try {
      await createIrrigation({
        bed_id: plant.bedId,
        irrigation_date: irrigationForm.irrigation_date,
        liters: irrigationForm.liters ? Number(irrigationForm.liters) : null,
        ph: irrigationForm.ph ? Number(irrigationForm.ph) : null,
        ec: irrigationForm.ec ? Number(irrigationForm.ec) : null,
        temperature: irrigationForm.temperature ? Number(irrigationForm.temperature) : null,
        humidity: irrigationForm.humidity ? Number(irrigationForm.humidity) : null,
        notes: irrigationForm.notes.trim(),
      })
      await onDataChanged?.()
      setIrrigationForm({
        irrigation_date: '',
        liters: '',
        ph: '',
        ec: '',
        temperature: '',
        humidity: '',
        notes: '',
      })
      setShowIrrigationForm(false)
    } catch (error) {
      setIrrigationError(error.message ?? 'No se pudo guardar la fertilización.')
    } finally {
      setSavingIrrigation(false)
    }
  }

  async function handleObservationSubmit(event) {
    event.preventDefault()
    setObservationError('')

    if (!observationForm.notes.trim()) {
      setObservationError('Escribe una observacion antes de guardar.')
      return
    }

    setSavingObservation(true)

    try {
      await appendPlantObservation(plant.id, observationForm.notes, plant.notes ?? '')
      await onDataChanged?.()
      setObservationForm({ notes: '' })
      setShowObservationForm(false)
    } catch (error) {
      setObservationError(error.message ?? 'No se pudo guardar la observacion.')
    } finally {
      setSavingObservation(false)
    }
  }

  return (
    <>
      <FormModal
        open={showEventForm}
        title="Registrar nuevo evento"
        onClose={() => {
          setShowEventForm(false)
          setEventType('')
          setEventValues(createInitialEventFormValues())
          setEventError('')
        }}
      >
        <form onSubmit={handleEventSubmit} className="space-y-4">
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tipo de evento</span>
              <select
                value={eventType}
                onChange={(formEvent) => {
                  setEventType(formEvent.target.value)
                  setEventValues(createInitialEventFormValues())
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              >
                <option value="">Selecciona un tipo</option>
                {availableEventTypes.map((eventOption) => (
                  <option key={eventOption.value} value={eventOption.value}>
                    {eventOption.label}
                  </option>
                ))}
              </select>
            </label>

            {eventType ? (
              <EventFormRenderer
                eventType={eventType}
                values={eventValues}
                onChange={handleEventValueChange}
              />
            ) : null}
          </div>
          <InlineFormMessage message={eventError} />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
                onClick={() => {
                  setShowEventForm(false)
                  setEventType('')
                  setEventValues(createInitialEventFormValues())
                  setEventError('')
                }}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingEvent}
              className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingEvent ? 'Guardando...' : 'Guardar evento'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={showIrrigationForm}
        title="Agregar nueva fertilización"
        onClose={() => setShowIrrigationForm(false)}
      >
        <form onSubmit={handleIrrigationSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Fecha</span>
              <input
                type="datetime-local"
                value={irrigationForm.irrigation_date}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({
                    ...current,
                    irrigation_date: formEvent.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Litros</span>
              <input
                type="number"
                step="0.01"
                value={irrigationForm.liters}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({ ...current, liters: formEvent.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">pH</span>
              <input
                type="number"
                step="0.01"
                value={irrigationForm.ph}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({ ...current, ph: formEvent.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">EC</span>
              <input
                type="number"
                step="0.01"
                value={irrigationForm.ec}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({ ...current, ec: formEvent.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Temperatura</span>
              <input
                type="number"
                step="0.1"
                value={irrigationForm.temperature}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({
                    ...current,
                    temperature: formEvent.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Humedad</span>
              <input
                type="number"
                step="0.1"
                value={irrigationForm.humidity}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({
                    ...current,
                    humidity: formEvent.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
            <label className="space-y-2 md:col-span-2 xl:col-span-3">
              <span className="text-sm font-medium text-slate-700">Notas</span>
              <textarea
                rows="4"
                value={irrigationForm.notes}
                onChange={(formEvent) =>
                  setIrrigationForm((current) => ({ ...current, notes: formEvent.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
              />
            </label>
          </div>
          <InlineFormMessage message={irrigationError} />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowIrrigationForm(false)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingIrrigation}
              className="rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingIrrigation ? 'Guardando...' : 'Guardar fertilización'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={showObservationForm}
        title="Agregar nueva observacion"
        onClose={() => setShowObservationForm(false)}
      >
        <form onSubmit={handleObservationSubmit} className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Observacion</span>
            <textarea
              rows="5"
              value={observationForm.notes}
              onChange={(formEvent) => setObservationForm({ notes: formEvent.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
            />
          </label>
          <InlineFormMessage message={observationError} />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowObservationForm(false)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingObservation}
              className="rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingObservation ? 'Guardando...' : 'Guardar observacion'}
            </button>
          </div>
        </form>
      </FormModal>
    </>
  )
}

export default PlantRecordModals
