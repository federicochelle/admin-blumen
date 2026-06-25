import EmptyState from '../../shared/EmptyState'

function PlantTimeline({ timeline }) {
  if (timeline.length === 0) {
    return (
      <EmptyState
        compact
        title="No hay eventos para esta planta"
        description="El timeline se construye automaticamente a partir de plant_events."
      />
    )
  }

  return (
    <div className="space-y-3">
      {timeline.map((item) => (
        <div key={item.id} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay-700">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
          {item.notes ? <p className="mt-2 text-sm text-slate-500">{item.notes}</p> : null}
        </div>
      ))}
    </div>
  )
}

export default PlantTimeline
