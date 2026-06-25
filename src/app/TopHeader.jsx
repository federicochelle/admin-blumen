import { useState } from 'react'

function TopHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="border-b border-slate-200 bg-white/92 backdrop-blur">
      <div className="flex flex-col gap-2 px-4 py-2 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Blumen</h2>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:border-slate-300"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-700 text-sm font-semibold text-white">
              BM
            </div>
            <span className="text-xs text-slate-400">{open ? '▴' : '▾'}</span>
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+12px)] z-20 min-w-[220px] rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Configuracion
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar sesion
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default TopHeader
