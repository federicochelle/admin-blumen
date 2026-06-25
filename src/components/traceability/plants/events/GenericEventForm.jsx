function GenericEventForm({ values, onChange }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Fecha</span>
        <input
          type="datetime-local"
          value={values.event_date}
          onChange={(event) => onChange('event_date', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>

      <div className="hidden md:block" />

      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Descripcion</span>
        <textarea
          rows="4"
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
        />
      </label>
    </div>
  )
}

export default GenericEventForm
