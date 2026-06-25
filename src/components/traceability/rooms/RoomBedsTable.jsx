import EmptyState from '../../shared/EmptyState'

function bedOccupancyLabel(bed) {
  if (!bed.visualCapacity || bed.visualCapacity <= 0) {
    return 'Sin capacidad'
  }

  return `${bed.occupancyPercentage}%`
}

function RoomBedsTable({ beds }) {
  if (beds.length === 0) {
    return (
      <EmptyState
        compact
        title="Esta sala todavia no tiene zonas registradas."
        description=""
      />
    )
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="overflow-x-auto">
        <div className="min-w-[860px] space-y-2">
          <div className="grid grid-cols-[1fr_0.7fr_0.8fr_0.8fr_1fr] gap-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            <span>Zona</span>
            <span className="text-right">Plantas</span>
            <span className="text-right">Capacidad</span>
            <span className="text-right">Ocupacion</span>
            <span>Ultimo riego</span>
          </div>

          {beds.map((bed) => (
            <div
              key={bed.id}
              className="grid grid-cols-[1fr_0.7fr_0.8fr_0.8fr_1fr] items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white px-3 py-3 text-sm"
            >
              <p className="font-semibold text-slate-950">{bed.code}</p>
              <p className="text-right font-medium text-slate-700">{bed.plantCount}</p>
              <p className="text-right font-medium text-slate-700">
                {bed.visualCapacity > 0 ? bed.visualCapacity : 'Sin definir'}
              </p>
              <p className="text-right font-semibold text-slate-950">{bedOccupancyLabel(bed)}</p>
              <p className="truncate text-slate-700">{bed.latestIrrigation ?? 'Sin riegos registrados.'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RoomBedsTable
