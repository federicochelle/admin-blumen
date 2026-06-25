import EmptyState from '../../shared/EmptyState'

function PlantIrrigationsBlock({ irrigations }) {
  if (irrigations.length === 0) {
    return (
      <EmptyState
        compact
        title="No hay riegos registrados"
        description="Los riegos asociados a la zona de esta planta apareceran en este bloque."
      />
    )
  }

  return (
    <div className="space-y-3">
      {irrigations.map((irrigation) => (
        <article
          key={irrigation.id}
          className="rounded-[1.35rem] border border-slate-200 bg-white p-4"
        >
          <p className="text-sm font-semibold text-slate-950">{irrigation.label}</p>
          <p className="mt-1 text-sm text-slate-500">{irrigation.date}</p>
        </article>
      ))}
    </div>
  )
}

export default PlantIrrigationsBlock
