function EmptyState({ title, description, compact = false }) {
  return (
    <div
      className={`rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-5 text-center ${
        compact ? 'py-8' : 'py-14'
      }`}
    >
      <div className="mx-auto max-w-md space-y-2">
        <p className="text-base font-semibold text-slate-900">{title}</p>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default EmptyState
