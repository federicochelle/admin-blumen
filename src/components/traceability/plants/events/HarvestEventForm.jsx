function HarvestEventForm({ values, onChange }) {
  return (
    <div className="grid gap-3">
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
        <span className="text-sm font-medium text-slate-700">Observación</span>
        <textarea
          rows="4"
          value={values.observation}
          onChange={(event) => onChange('observation', event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
          placeholder="Opcional"
        />
      </label>
    </div>
  )
}

export default HarvestEventForm
