function StatCard({ title, value, meta, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-white text-slate-950',
    accent: 'border-forest-200 bg-forest-50 text-forest-900',
    muted: 'border-sand-200 bg-sand-50 text-slate-900',
  }

  return (
    <article className={`rounded-[1.5rem] border p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      {meta ? <p className="mt-2 text-sm text-slate-500">{meta}</p> : null}
    </article>
  )
}

export default StatCard
