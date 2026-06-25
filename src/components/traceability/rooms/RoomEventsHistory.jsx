import { useMemo, useState } from 'react'
import EmptyState from '../../shared/EmptyState'
import { getRoomEventTypeLabel, getRoomEventTypeTone } from '../../../constants/roomEventTypes'
import { deleteRoomEvent } from '../../../services/traceability.service'
import RoomEventDetailModal from './RoomEventDetailModal'

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
  if (type === 'LIMPIEZA') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 6h8" />
        <path d="M9 6v11a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6" />
        <path d="M10 10h4" />
      </svg>
    )
  }

  if (type === 'DESINFECCION' || type === 'CONTROL_PLAGAS') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
        <path d="M9.5 12.5l1.5 1.5 3.5-4" />
      </svg>
    )
  }

  if (type === 'CONTROL_AMBIENTAL') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v12" />
        <path d="M9 6a3 3 0 1 1 6 0v9a4 4 0 1 1-6 0Z" />
      </svg>
    )
  }

  if (type === 'MANTENIMIENTO') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m14 7 3-3 3 3-3 3" />
        <path d="M4 20l8-8" />
        <path d="m10 6 8 8" />
      </svg>
    )
  }

  if (type === 'CAMBIO_LUCES') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />
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

function RoomEventsHistory({ events = [], onEventDeleted }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [deletingEventId, setDeletingEventId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const sortedEvents = useMemo(() => sortEventsDesc(events), [events])

  function handleOpenEvent(event) {
    setSelectedEvent(event)
  }

  function handleCloseEvent() {
    setSelectedEvent(null)
  }

  async function handleDeleteEvent(eventId) {
    if (!eventId) {
      return
    }

    const confirmed = window.confirm('¿Eliminar este evento?')

    if (!confirmed) {
      return
    }

    setDeleteError('')
    setDeletingEventId(eventId)

    try {
      await deleteRoomEvent(eventId)

      if (selectedEvent?.id === eventId) {
        handleCloseEvent()
      }

      await onEventDeleted?.()
    } catch (error) {
      setDeleteError(error.message ?? 'No se pudo eliminar el evento de sala.')
    } finally {
      setDeletingEventId(null)
    }
  }

  function handleEventKeyDown(nativeEvent, event) {
    if (nativeEvent.key === 'Enter' || nativeEvent.key === ' ') {
      nativeEvent.preventDefault()
      handleOpenEvent(event)
    }
  }

  if (sortedEvents.length === 0) {
    return (
      <EmptyState
        compact
        title="No hay eventos de sala registrados"
        description=""
      />
    )
  }

  return (
    <>
      <div className="space-y-3">
        {deleteError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {deleteError}
          </div>
        ) : null}
        {sortedEvents.map((event) => {
          const eventType = event.event_type ?? null
          const label = getRoomEventTypeLabel(eventType)
          const toneClasses = getToneClasses(getRoomEventTypeTone(eventType))
          const isDeleting = deletingEventId === event.id

          return (
            <article
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenEvent(event)}
              onKeyDown={(nativeEvent) => handleEventKeyDown(nativeEvent, event)}
              className="cursor-pointer rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-brand-lavender/60"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${toneClasses.icon}`}
                >
                  <EventIcon type={eventType} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneClasses.badge}`}
                      >
                        {label}
                      </span>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatEventDate(event.event_date ?? event.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation()
                          handleDeleteEvent(event.id)
                        }}
                        onKeyDown={(keyboardEvent) => keyboardEvent.stopPropagation()}
                        disabled={isDeleting}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Eliminar evento ${label}`}
                        title="Eliminar evento"
                      >
                        {isDeleting ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-300 border-t-rose-700" />
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M4 7h16" />
                            <path d="M9 7V5h6v2" />
                            <path d="M8 7l.6 11.2A2 2 0 0 0 10.6 20h2.8a2 2 0 0 0 2-1.8L16 7" />
                            <path d="M10 11v5" />
                            <path d="M14 11v5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <RoomEventDetailModal
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onClose={handleCloseEvent}
      />
    </>
  )
}

export default RoomEventsHistory
