import {
  getPlantEventTypeLabel,
  getPlantEventTypeTone,
  matchesPlantEventMilestone,
  PLANT_EVENT_MILESTONES,
} from '../../../constants/plantEventTypes'

const VISUAL_TIMELINE_MILESTONES = PLANT_EVENT_MILESTONES.filter(
  (milestone) => milestone.key !== 'FLORACION',
)

function MilestoneIcon({ type, active = false }) {
  const className = active ? 'h-5 w-5' : 'h-5 w-5 opacity-70'

  if (type === 'germinacion') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20V11" />
        <path d="M12 11c0-3 2-5 5-6 0 3-1 6-5 6Z" />
        <path d="M12 14c0-2-1-4-4-5 0 3 1 5 4 5Z" />
      </svg>
    )
  }

  if (type === 'PRIMER_TRASPLANTE' || type === 'SEGUNDO_TRASPLANTE') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 6h10" />
        <path d="M8 6l1.5 11h5L16 6" />
        <path d="M10 10v4" />
        <path d="M14 9v5" />
      </svg>
    )
  }

  if (type === 'FLORACION') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 6v12" />
        <path d="M12 10c-2.5 0-4.5-2-4.5-4.5C10 5.5 12 7.5 12 10Z" />
        <path d="M12 10c2.5 0 4.5-2 4.5-4.5C14 5.5 12 7.5 12 10Z" />
        <path d="M12 13c-2.2 0-4 1.8-4 4 2.2 0 4-1.8 4-4Z" />
        <path d="M12 13c2.2 0 4 1.8 4 4-2.2 0-4-1.8-4-4Z" />
      </svg>
    )
  }

  if (type === 'cosecha') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 14c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5Z" />
        <path d="M12 9V5" />
        <path d="M12 5c1.5 0 3 .5 4 2" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="5" />
    </svg>
  )
}

const EVENT_STYLES = {
  completed: {
    rail: 'bg-emerald-200',
    dot: 'border-emerald-300 bg-emerald-100 text-emerald-700',
    card: 'border-emerald-200 bg-white',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  current: {
    rail: 'bg-violet-200',
    dot: 'border-violet-400 bg-violet-500 text-white',
    card: 'border-violet-200 bg-violet-50/70',
    badge: 'bg-violet-100 text-violet-700',
  },
  informative: {
    rail: 'bg-sky-200',
    dot: 'border-sky-300 bg-sky-100 text-sky-700',
    card: 'border-sky-200 bg-sky-50/70',
    badge: 'bg-sky-100 text-sky-700',
  },
  problem: {
    rail: 'bg-rose-200',
    dot: 'border-rose-300 bg-rose-100 text-rose-700',
    card: 'border-rose-200 bg-rose-50/70',
    badge: 'bg-rose-100 text-rose-700',
  },
  neutral: {
    rail: 'bg-slate-200',
    dot: 'border-slate-300 bg-white text-slate-700',
    card: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-700',
  },
}

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

function isInformativeEvent(eventType) {
  return ['blue', 'yellow'].includes(getPlantEventTypeTone(eventType))
}

function isProblemEvent(eventType) {
  return getPlantEventTypeTone(eventType) === 'red' || String(eventType).includes('problema')
}

function resolveEventTone(eventType) {
  const tone = getPlantEventTypeTone(eventType)

  if (!eventType || tone === 'neutral') {
    return EVENT_STYLES.neutral
  }

  if (tone === 'red') {
    return EVENT_STYLES.problem
  }

  if (tone === 'violet') {
    return EVENT_STYLES.current
  }

  if (tone === 'blue' || tone === 'yellow') {
    return EVENT_STYLES.informative
  }

  if (tone === 'orange') {
    return EVENT_STYLES.completed
  }

  return EVENT_STYLES.completed
}

function getEventInitials(label) {
  const words = label.split(' ').filter(Boolean)

  if (words.length === 0) {
    return 'EV'
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

function normalizeEvent(event, index, total) {
  const eventType = event?.event_type ?? event?.type ?? null
  const title = getPlantEventTypeLabel(eventType)
  const description = event?.description ?? event?.notes ?? null
  const eventDate = event?.event_date ?? event?.date ?? null
  const isCurrent = index === total - 1 && !isProblemEvent(eventType)

  return {
    id: event?.id ?? `${eventType ?? 'event'}-${eventDate ?? 'no-date'}`,
    eventType,
    title,
    description,
    eventDate,
    formattedDate: formatEventDate(eventDate),
    tone: resolveEventTone(eventType ?? ''),
    initials: getEventInitials(title),
    badgeLabel: isProblemEvent(eventType)
      ? 'Problema'
      : isCurrent
        ? 'Actual'
        : isInformativeEvent(eventType)
          ? 'Info'
          : 'Completado',
  }
}

function sortEventsAscending(events) {
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

    return new Date(leftValue) - new Date(rightValue)
  })
}

function isHiddenFromVisualTimeline(eventType) {
  const normalized = String(eventType ?? '').trim().toLowerCase()

  return ['floracion', 'cambio_etapa', 'inicio_floracion'].includes(normalized)
}

function PlantVisualTimeline({ events = [], layout = 'vertical', title = 'Línea de vida', value = null }) {
  const sortedEvents = sortEventsAscending(events).filter((event) => {
    const eventType = event?.event_type ?? event?.type ?? null
    return !isHiddenFromVisualTimeline(eventType)
  })
  const normalizedEvents = sortedEvents.map((event, index) =>
    normalizeEvent(event, index, sortedEvents.length),
  )

  if (normalizedEvents.length === 0) {
    return <p className="text-sm text-slate-500">No hay eventos registrados para esta planta.</p>
  }

  if (layout === 'horizontal-compact') {
    const lastCompletedIndex = VISUAL_TIMELINE_MILESTONES.reduce((latestIndex, milestone, index) => {
      return normalizedEvents.some((event) => matchesPlantEventMilestone(event.eventType, milestone.key))
        ? index
        : latestIndex
    }, -1)

    const milestones = VISUAL_TIMELINE_MILESTONES.map((milestone, index) => {
      const matchingEvent = normalizedEvents.find((event) =>
        matchesPlantEventMilestone(event.eventType, milestone.key),
      )

      return {
        ...milestone,
        event: matchingEvent ?? null,
        isCompleted: matchingEvent ? true : index <= lastCompletedIndex && lastCompletedIndex >= 0,
      }
    })

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              {title}
            </p>
          </div>
          {value ? <p className="text-sm font-semibold text-slate-950">{value}</p> : null}
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center px-2 py-3">
            {milestones.map((milestone, index) => (
              <div key={milestone.key} className="flex items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border text-xs font-bold tracking-[0.16em] shadow-[0_8px_20px_rgba(15,23,42,0.08)] ${
                    milestone.isCompleted
                      ? milestone.event?.tone.dot ?? 'border-emerald-300 bg-emerald-100 text-emerald-700'
                      : 'border-slate-200 bg-slate-100 text-slate-300'
                  }`}
                  title={
                    milestone.event
                      ? `${milestone.label} · ${milestone.event.formattedDate}${
                          milestone.event.description ? ` · ${milestone.event.description}` : ''
                        }`
                      : `${milestone.label} · Pendiente`
                  }
                  aria-label={milestone.label}
                >
                  <MilestoneIcon type={milestone.key} active={milestone.isCompleted} />
                </div>

                {index < milestones.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`mx-2 h-px w-10 sm:w-16 ${
                      milestone.isCompleted ? milestone.event?.tone.rail ?? 'bg-emerald-200' : 'bg-slate-200'
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-[#f7f5f1] p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">
            Línea de vida
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Historial completo de eventos de la planta.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {normalizedEvents.length} eventos
        </span>
      </div>

      <div className="relative space-y-4">
        {normalizedEvents.map((event, index) => (
          <article key={event.id} className="relative grid grid-cols-[3rem_1fr] gap-3 sm:gap-4">
            {index < normalizedEvents.length - 1 ? (
              <span
                aria-hidden="true"
                className={`absolute left-[1.45rem] top-12 h-[calc(100%+0.9rem)] w-px ${event.tone.rail}`}
              />
            ) : null}

            <div className="relative flex justify-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-xs font-bold tracking-[0.16em] ${event.tone.dot}`}
              >
                {event.initials}
              </div>
            </div>

            <div className={`rounded-[1.35rem] border p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${event.tone.card}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{event.formattedDate}</p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${event.tone.badge}`}
                >
                  {event.badgeLabel}
                </span>
              </div>

              {event.description ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PlantVisualTimeline
