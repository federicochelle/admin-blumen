import { useState } from 'react'
import EmptyState from '../../shared/EmptyState'
import {
  getPlantEventTypeLabel,
  getPlantEventTypeTone,
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

  if (type === 'COSECHA' || type === 'cosecha') {
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
    const leftValue = left?.event_date ?? left?.eventDate ?? null
    const rightValue = right?.event_date ?? right?.eventDate ?? null

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

function RoomActivityEventModal({ event, onClose }) {
  if (!event) {
    return null
  }

  const label = getPlantEventTypeLabel(event.event_type)
  const tone = getPlantEventTypeTone(event.event_type)
  const toneClasses = getToneClasses(tone)

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar detalle del evento"
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-slate-950/30"
      />

      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <section className="w-full max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${toneClasses.icon}`}
              >
                <EventIcon type={event.event_type} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Detalle del evento
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/55 bg-brand-deep-purple text-white transition hover:border-brand-deeper-purple hover:bg-brand-deeper-purple"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-transparent bg-transparent px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tipo de evento
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{label}</p>
            </div>

            <div className="rounded-[1.2rem] border border-transparent bg-transparent px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Fecha
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {formatEventDate(event.event_date)}
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-transparent bg-transparent px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Planta
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {event.plantCode ?? 'Sin codigo'}
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-transparent bg-transparent px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Zona actual
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {event.bedCode ?? 'Sin zona'}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.2rem] border border-transparent bg-transparent px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Descripcion
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {event.description ?? 'Sin descripción'}
            </p>
          </div>
        </section>
      </div>
    </>
  )
}

function RoomActivityFeed({ plants = [], limit = 8 }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const recentEvents = sortEventsDesc(
    plants.flatMap((plant) =>
      (plant.events ?? []).map((event) => ({
        id: `${plant.id}-${event.id ?? event.event_date ?? event.date ?? 'no-date'}`,
        plantCode: plant.code ?? 'Sin codigo',
        bedCode: plant.bed ?? plant.location?.code ?? null,
        event_type: event.event_type ?? event.type ?? null,
        event_date: event.event_date ?? event.date ?? null,
        description: event.description ?? event.notes ?? null,
      })),
    ),
  ).slice(0, limit)

  if (recentEvents.length === 0) {
    return (
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Actividad de plantas
          </p>
        </div>

        <EmptyState
          compact
          title="Todavía no hay eventos registrados para las plantas de esta sala."
          description=""
        />
      </section>
    )
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
          Actividad de plantas
        </p>
      </div>

      <div className="space-y-3">
        {recentEvents.map((event) => {
          const label = getPlantEventTypeLabel(event.event_type)
          const tone = getPlantEventTypeTone(event.event_type)
          const toneClasses = getToneClasses(tone)

          return (
            <button
              type="button"
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="block w-full rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-brand-light-lilac hover:bg-brand-light-lilac/12"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${toneClasses.icon}`}
                >
                  <EventIcon type={event.event_type} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-950">{label}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatEventDate(event.event_date)}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses.badge}`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <RoomActivityEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  )
}

export default RoomActivityFeed
