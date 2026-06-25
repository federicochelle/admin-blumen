function RoomDetailHeader({ room, onEditRoom, onDeleteRoom, deleting = false }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-0 shrink-0 items-center gap-3">
          <span className="rounded-full border border-brand-turquoise/45 bg-brand-turquoise/12 px-4 py-2 text-2xl font-semibold tracking-tight text-brand-turquoise">
            {room.type}
          </span>
        </div>

        <section className="flex flex-1 flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Plantas
            </p>
            <p className="text-lg font-semibold text-slate-950">{room.totalPlants ?? 0}</p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Zonas
            </p>
            <p className="text-lg font-semibold text-slate-950">{room.totalBeds ?? 0}</p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Capacidad
            </p>
            <p className="text-lg font-semibold text-slate-950">{room.capacity ?? 0}</p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Ocupacion
            </p>
            <p className="text-lg font-semibold text-slate-950">
              {room.occupancyPercentage ?? 0}%
            </p>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onEditRoom}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-lavender/55 bg-white px-3.5 py-2 text-sm font-medium text-brand-deep-purple transition hover:border-brand-deep-purple hover:bg-brand-light-lilac/18 hover:text-brand-deeper-purple"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
            Editar sala
          </button>
          <button
            type="button"
            onClick={onDeleteRoom}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M6 7l1 12h10l1-12" />
              <path d="M9 7V4h6v3" />
            </svg>
            {deleting ? 'Eliminando...' : 'Eliminar sala'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default RoomDetailHeader
