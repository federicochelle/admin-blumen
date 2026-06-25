import { useState } from 'react'
import { ROOM_EVENT_TYPES } from '../../../constants/roomEventTypes'
import { createRoomEvent } from '../../../services/traceability.service'

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

function formatCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function RoomEventModal({ open, room, onClose, onCreated }) {
  const [form, setForm] = useState({
    event_type: '',
    event_date: formatCurrentDateTime(),
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleClose() {
    setSubmitError('')
    setForm({
      event_type: '',
      event_date: formatCurrentDateTime(),
      description: '',
    })
    onClose?.()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!room?.id) {
      setSubmitError('No se encontro la sala para registrar el evento.')
      return
    }

    if (!form.event_type.trim() || !form.event_date) {
      setSubmitError('Completa el tipo de evento y la fecha.')
      return
    }

    const parsedEventDate = new Date(form.event_date)

    if (Number.isNaN(parsedEventDate.getTime())) {
      setSubmitError('La fecha del evento no es valida.')
      return
    }

    setSaving(true)

    try {
      await createRoomEvent({
        room_id: room.id,
        event_type: form.event_type.trim(),
        event_date: parsedEventDate.toISOString(),
        description: form.description.trim() || null,
        created_by: 'admin',
      })

      await onCreated?.()
      handleClose()
    } catch (error) {
      setSubmitError(error.message ?? 'No se pudo registrar el evento de sala.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar modal de evento de sala"
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
        <section className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 pb-1">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Nuevo evento de sala
              </p>
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

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Tipo de evento</span>
                <select
                  value={form.event_type}
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, event_type: formEvent.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                >
                  <option value="">Selecciona un tipo</option>
                  {ROOM_EVENT_TYPES.map((eventType) => (
                    <option key={eventType.value} value={eventType.value}>
                      {eventType.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Fecha</span>
                <input
                  type="datetime-local"
                  value={form.event_date}
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, event_date: formEvent.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Descripcion</span>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, description: formEvent.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                />
              </label>
            </div>

            <InlineFormMessage message={submitError} />

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
                disabled={saving}
                className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Registrando...' : 'Guardar evento'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default RoomEventModal
