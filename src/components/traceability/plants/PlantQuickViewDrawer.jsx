import {
  getPlantEventTypeLabel,
  getPlantEventTypeTone,
  isPlantCreationEventType,
  isPlantDryingEventType,
  isPlantTransplantEventType,
} from '../../../constants/plantEventTypes'

function formatEventDate(value) {
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

function getToneClasses(tone) {
  if (tone === 'green') {
    return {
      icon: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700',
    }
  }

  if (tone === 'violet') {
    return {
      icon: 'border-violet-200 bg-violet-50 text-violet-700',
      badge: 'bg-violet-100 text-violet-700',
    }
  }

  if (tone === 'blue') {
    return {
      icon: 'border-sky-200 bg-sky-50 text-sky-700',
      badge: 'bg-sky-100 text-sky-700',
    }
  }

  if (tone === 'yellow') {
    return {
      icon: 'border-amber-200 bg-amber-50 text-amber-700',
      badge: 'bg-amber-100 text-amber-700',
    }
  }

  if (tone === 'orange') {
    return {
      icon: 'border-orange-200 bg-orange-50 text-orange-700',
      badge: 'bg-orange-100 text-orange-700',
    }
  }

  if (tone === 'red') {
    return {
      icon: 'border-rose-200 bg-rose-50 text-rose-700',
      badge: 'bg-rose-100 text-rose-700',
    }
  }

  return {
    icon: 'border-slate-200 bg-slate-50 text-slate-700',
    badge: 'bg-slate-100 text-slate-700',
  }
}

function EventIcon({ type }) {
  if (type === 'CREACION' || String(type ?? '').toLowerCase() === 'creacion') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    )
  }

  if (type === 'GERMINACION' || type === 'germinacion') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20V11" />
        <path d="M12 11c0-3 2-5 5-6 0 3-1 6-5 6Z" />
        <path d="M12 14c0-2-1-4-4-5 0 3 1 5 4 5Z" />
      </svg>
    )
  }

  if (isPlantTransplantEventType(type)) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 6h10" />
        <path d="M8 6l1.5 11h5L16 6" />
        <path d="M10 10v4" />
        <path d="M14 9v5" />
      </svg>
    )
  }

  if (type === 'FLORACION' || type === 'floracion' || type === 'CAMBIO_ETAPA' || type === 'cambio_etapa') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 6v12" />
        <path d="M12 10c-2.5 0-4.5-2-4.5-4.5C10 5.5 12 7.5 12 10Z" />
        <path d="M12 10c2.5 0 4.5-2 4.5-4.5C14 5.5 12 7.5 12 10Z" />
        <path d="M12 13c-2.2 0-4 1.8-4 4 2.2 0 4-1.8 4-4Z" />
        <path d="M12 13c2.2 0 4 1.8 4 4-2.2 0-4-1.8-4-4Z" />
      </svg>
    )
  }

  if (type === 'CONTROL_SANITARIO' || type === 'control_sanitario') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
        <path d="M9.5 12.5l1.5 1.5 3.5-4" />
      </svg>
    )
  }

  if (type === 'FERTILIZACION' || type === 'riego' || type === 'fertilizacion') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3C12 3 7 9 7 13a5 5 0 0 0 10 0c0-4-5-10-5-10Z" />
      </svg>
    )
  }

  if (isPlantDryingEventType(type)) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 14c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5Z" />
        <path d="M12 9V5" />
        <path d="M12 5c1.5 0 3 .5 4 2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}

function sortEventsDesc(events) {
  return [...events].sort((left, right) => {
    const leftValue = left?.event_date ?? left?.date ?? null
    const rightValue = right?.event_date ?? right?.date ?? null

    if (!leftValue && !rightValue) {
      return 0
    }

    if (!leftValue) {
      return 1
    }

    if (!rightValue) {
      return -1
    }

    return new Date(rightValue) - new Date(leftValue)
  })
}

function PlantQuickViewDrawer({ plant, open, onClose, onOpenPlantDetail }) {
  const recentEvents = sortEventsDesc(plant?.events ?? [])
    .filter((event) => !isPlantCreationEventType(event?.event_type ?? event?.type))
    .slice(0, 4)

  function handleOpenFullDetail() {
    if (!plant?.id) {
      return
    }

    onClose?.()
    onOpenPlantDetail?.(plant.id)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar ficha de planta"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/20 transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-[420px] transform border-l border-slate-200 bg-[#f8f6f2] shadow-[-24px_0_48px_rgba(15,23,42,0.16)] transition-transform duration-300 sm:w-[420px] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5">
            <div className="min-w-0">
              <h3 className="truncate text-2xl font-semibold tracking-tight text-slate-950">
                {plant?.code ?? 'Sin codigo'}
              </h3>
              <p className="mt-2 truncate text-sm font-semibold text-brand-deeper-purple">
                {plant?.batchLabel ?? 'Sin lote'}
              </p>
              <p className="mt-1 truncate text-sm text-slate-500">{plant?.strain ?? 'Sin genetica'}</p>
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

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <section className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Actividad reciente
              </p>
              {recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentEvents.map((event) => {
                    const eventType = event.event_type ?? event.type ?? null
                    const label = getPlantEventTypeLabel(eventType)
                    const tone = getPlantEventTypeTone(eventType)
                    const toneClasses = getToneClasses(tone)

                    return (
                      <article
                        key={event.id}
                        className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${toneClasses.icon}`}
                          >
                            <EventIcon type={eventType} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="min-w-0">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">{label}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {formatEventDate(event.event_date ?? event.date)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Todavía no hay actividad registrada para esta planta.</p>
              )}
            </section>

            <button
              type="button"
              onClick={handleOpenFullDetail}
              className="w-full rounded-xl bg-brand-turquoise px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-deep-purple"
            >
              Ver ficha completa
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default PlantQuickViewDrawer
