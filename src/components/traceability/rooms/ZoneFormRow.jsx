import { useState } from 'react'

function ZoneFormRow({ zone, error = {}, onChange, onConfirm }) {
  const [draftZone, setDraftZone] = useState(zone)

  function handleFieldChange(field, value) {
    setDraftZone((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleConfirm() {
    const rowCount = Math.max(1, Number(draftZone.row_count) || 1)
    const columnCount = Math.max(1, Number(draftZone.column_count) || 1)

    const nextZone = {
      ...draftZone,
      row_count: rowCount,
      column_count: columnCount,
      capacity: rowCount * columnCount,
    }

    onChange(nextZone)
    onConfirm?.(nextZone)
  }

  const previewCapacity =
    Math.max(1, Number(draftZone.row_count) || 1) * Math.max(1, Number(draftZone.column_count) || 1)

  return (
    <article className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_0.7fr_0.7fr_0.8fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input
            type="text"
            value={draftZone.code}
            onChange={(event) => handleFieldChange('code', event.target.value)}
            placeholder="Selecciona un nombre"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
          />
          {error.code ? <span className="text-xs text-red-600">{error.code}</span> : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Filas</span>
          <input
            type="number"
            min="1"
            value={draftZone.row_count}
            onChange={(event) => handleFieldChange('row_count', event.target.value)}
            placeholder="Ej: 3"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
          />
          {error.row_count ? <span className="text-xs text-red-600">{error.row_count}</span> : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Columnas</span>
          <input
            type="number"
            min="1"
            value={draftZone.column_count}
            onChange={(event) => handleFieldChange('column_count', event.target.value)}
            placeholder="Ej: 4"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
          />
          {error.column_count ? (
            <span className="text-xs text-red-600">{error.column_count}</span>
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Capacidad</span>
          <input
            type="number"
            min="1"
            value={previewCapacity}
            readOnly
            className="w-full rounded-xl border border-brand-light-lilac/45 bg-brand-light-lilac/18 px-3 py-2.5 text-sm text-brand-deep-purple outline-none"
          />
          {error.capacity ? <span className="text-xs text-red-600">{error.capacity}</span> : null}
        </label>

        <label className="space-y-2 md:col-span-2 xl:col-span-4">
          <span className="text-sm font-medium text-slate-700">Descripcion</span>
          <textarea
            rows="2"
            value={draftZone.description}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            placeholder="Detalle opcional sobre esta zona"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-xl bg-brand-turquoise px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple"
        >
          Confirmar
        </button>
      </div>
    </article>
  )
}

export default ZoneFormRow
