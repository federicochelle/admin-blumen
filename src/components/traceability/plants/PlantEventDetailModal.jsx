import { getPlantEventTypeLabel } from '../../../constants/plantEventTypes'

function formatEventDateTime(value) {
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function toReadableLabel(value) {
  if (!value) {
    return 'Dato'
  }

  return String(value)
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatEventDataValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Sin dato'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

function extractDrainObservation(description) {
  const normalized = String(description ?? '').trim()

  if (!normalized) {
    return 'Sin dato'
  }

  const parts = normalized.split('. ')
  return parts.length > 1 ? parts.slice(1).join('. ').trim() || 'Sin dato' : normalized
}

function DetailField({ label, value, secondary = false }) {
  return (
    <div className="px-1 py-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 break-words text-sm ${secondary ? 'text-slate-600' : 'font-semibold text-slate-950'}`}>
        {value || 'Sin dato'}
      </p>
    </div>
  )
}

function PlantEventDetailModal({ event, open, onClose }) {
  const eventType = event?.event_type ?? event?.type ?? null
  const normalizedEventType = String(eventType ?? '').trim().toUpperCase()
  const label = getPlantEventTypeLabel(eventType)
  const eventData = event?.event_data ?? event?.eventData ?? null
  const eventDataEntries = eventData && typeof eventData === 'object' ? Object.entries(eventData) : []
  const isDrainEvent = normalizedEventType === 'DRENADO'
  const shouldShowEventData =
    eventDataEntries.length > 0 && normalizedEventType !== 'FLORACION' && !isDrainEvent

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar modal detalle del evento"
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
                Detalle del evento
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

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Tipo de evento" value={label} />
              <DetailField label="Fecha" value={formatEventDateTime(event?.event_date ?? event?.date)} />
              <DetailField label="Creado por" value={event?.created_by ?? 'Sin dato'} />
            </div>

            {isDrainEvent ? (
              <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">pH salida</span>
                    <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950">
                      {formatEventDataValue(eventData?.ph_out)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">EC salida</span>
                    <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950">
                      {formatEventDataValue(eventData?.ec_out)}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Observacion</span>
                    <div className="min-h-[112px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950">
                      {extractDrainObservation(event?.description ?? event?.notes)}
                    </div>
                  </div>
              </div>
            ) : (
              <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Descripción
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {event?.description ?? event?.notes ?? 'Sin descripción'}
                </p>
              </section>
            )}

            {shouldShowEventData ? (
              <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Datos del evento
                </p>

                <div className="mt-4 space-y-3">
                  {eventDataEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 rounded-[1.1rem] border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-slate-600">{toReadableLabel(key)}</p>
                      <p className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-950">
                        {formatEventDataValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

          </div>
        </section>
      </div>
    </>
  )
}

export default PlantEventDetailModal
