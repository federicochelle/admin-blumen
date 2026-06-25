function FertilizationEventForm({ values, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Fecha</span>
        <input
          type="datetime-local"
          value={values.event_date}
          onChange={(event) => onChange('event_date', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Producto</span>
        <input
          type="text"
          value={values.product}
          onChange={(event) => onChange('product', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Dosis</span>
        <input
          type="text"
          value={values.dose}
          onChange={(event) => onChange('dose', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">pH</span>
        <input
          type="number"
          step="0.01"
          value={values.ph}
          onChange={(event) => onChange('ph', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">EC</span>
        <input
          type="number"
          step="0.01"
          value={values.ec}
          onChange={(event) => onChange('ec', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Litros</span>
        <input
          type="number"
          step="0.01"
          value={values.liters}
          onChange={(event) => onChange('liters', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <label className="space-y-2 md:col-span-2 xl:col-span-3">
        <span className="text-sm font-medium text-slate-700">Observacion</span>
        <textarea
          rows="4"
          value={values.observation}
          onChange={(event) => onChange('observation', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>
    </div>
  )
}

export default FertilizationEventForm
