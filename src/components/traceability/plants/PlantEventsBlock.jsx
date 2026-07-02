import EmptyState from '../../shared/EmptyState'
import { isPlantCreationEventType } from '../../../constants/plantEventTypes'

function PlantEventsBlock({ events }) {
  const visibleEvents = events.filter((event) => !isPlantCreationEventType(event?.event_type ?? event?.type))

  if (visibleEvents.length === 0) {
    return (
      <EmptyState
        compact
        title="No hay eventos para esta planta"
        description="Cuando existan registros en plant_events se mostraran aqui."
      />
    )
  }

  return (
    <div className="space-y-3">
      {visibleEvents.map((event) => (
        <article key={event.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{event.label}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                {event.type}
              </p>
            </div>
            <p className="text-sm text-slate-500">{event.date}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default PlantEventsBlock
