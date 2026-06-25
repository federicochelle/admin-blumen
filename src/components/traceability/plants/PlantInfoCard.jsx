import StatusBadge from '../../shared/StatusBadge'

function PlantInfoCard({ plant }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-700">
            Planta seleccionada
          </p>
          <h4 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {plant.code}
          </h4>
          <p className="mt-1 text-sm text-slate-500">{plant.strain}</p>
        </div>
        <StatusBadge value={plant.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ubicacion</p>
          <p className="mt-1 font-semibold text-slate-900">
            {plant.room} · {plant.bed}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Etapa</p>
          <p className="mt-1 font-semibold text-slate-900">{plant.stage}</p>
          <p className="mt-1 text-xs text-slate-500">
            Primer trasplante: {plant.firstTransplantAt ?? 'Sin fecha'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PlantInfoCard
