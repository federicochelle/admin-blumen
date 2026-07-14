import { useState } from 'react'
import { createPlantEventsBatch, getPlants, updatePlant } from '../../../services/traceability.service'
import EventFormRenderer from '../plants/events/EventFormRenderer'
import { buildPlantEventPayload, createInitialEventFormValues, validateEventForm, getStageUpdateForEventType } from '../plants/events/eventFormUtils'
import { MANUAL_PLANT_EVENT_TYPES } from '../../../constants/plantEventTypes'

function InlineFormMessage({ message }) {
  if (!message) return null
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
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

      <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition duration-200 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`} aria-hidden={!open}>
        <section className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/55 bg-brand-deep-purple text-white"
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

function MultiPlantEventModal({ open, plantIds = [], onClose, onCreated }) {
  const [eventType, setEventType] = useState('')
  const [eventValues, setEventValues] = useState(() => createInitialEventFormValues())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const validationError = validateEventForm(eventType, eventValues)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!Array.isArray(plantIds) || plantIds.length === 0) {
      setError('No hay plantas seleccionadas.')
      return
    }

    setSaving(true)

    const nextStage = getStageUpdateForEventType(eventType)
    const updatedPlantIds = []
    const previousStagesById = {}

    try {
      if (nextStage) {
        const allPlants = await getPlants()
        const plantsMap = (allPlants ?? []).reduce((acc, p) => {
          acc[String(p.id)] = p
          return acc
        }, {})

        for (const plantId of plantIds) {
          const plant = plantsMap[String(plantId)]
          previousStagesById[plantId] = plant?.stage ?? null
          await updatePlant({ id: plantId, stage: nextStage })
          updatedPlantIds.push(plantId)
        }
      }

      const payload = buildPlantEventPayload(eventType, eventValues)
      const payloads = plantIds.map((plantId) => ({
        plant_id: plantId,
        event_type: eventType.trim(),
        event_date: payload.event_date,
        description: payload.description,
        event_data: payload.event_data,
        created_by: 'admin',
      }))

      await createPlantEventsBatch(payloads)
      await onCreated?.()
      setEventType('')
      setEventValues(createInitialEventFormValues())
      onClose?.()
    } catch (err) {
      if (updatedPlantIds.length > 0) {
        const rollbackIssues = []
        for (const id of updatedPlantIds) {
          try {
            const prev = previousStagesById[id]
            await updatePlant({ id, stage: prev })
          } catch (rbErr) {
            rollbackIssues.push(String(id))
          }
        }

        if (rollbackIssues.length > 0) {
          setError(
            `No se pudieron revertir algunos cambios de etapa para las plantas: ${rollbackIssues.join(', ')}. Error: ${err.message}`,
          )
          setSaving(false)
          return
        }
      }

      setError(err.message ?? 'No se pudo registrar los eventos.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <FormModal open={open} title={`Registrar evento a ${plantIds.length} plantas`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Tipo de evento</span>
            <select
              value={eventType}
              onChange={(ev) => {
                setEventType(ev.target.value)
                setEventValues(createInitialEventFormValues())
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
            >
              <option value="">Selecciona un tipo</option>
              {MANUAL_PLANT_EVENT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          {eventType ? (
            <EventFormRenderer eventType={eventType} values={eventValues} onChange={(field, value) => setEventValues((c) => ({ ...c, [field]: value }))} />
          ) : null}
        </div>

        <InlineFormMessage message={error} />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Registrando...' : 'Registrar evento'}</button>
        </div>
      </form>
    </FormModal>
  )
}

export default MultiPlantEventModal
