function PlantTableRow({ plant, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plant)}
      className={`grid w-full grid-cols-[1.85fr_1fr_0.95fr_0.95fr_0.9fr] items-center gap-3 rounded-[1.1rem] border px-3 py-3 text-left text-sm transition ${
        selected
          ? 'border-brand-lavender bg-brand-light-lilac/22 shadow-[0_10px_22px_rgba(91,70,111,0.12)]'
          : 'border-brand-light-lilac/35 bg-white hover:border-brand-lavender hover:bg-brand-light-lilac/12'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light-lilac/25 text-sm font-semibold text-brand-deep-purple">
          {(plant.code ?? '?').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-brand-deeper-purple">{plant.code}</p>
          <p className="mt-1 truncate text-xs text-brand-deep-purple">{plant.strain}</p>
        </div>
      </div>
      <p className="truncate text-brand-deep-purple">{plant.room}</p>
      <p className="truncate text-brand-deep-purple">{plant.bed}</p>
      <p className="truncate text-brand-deep-purple">{plant.stage}</p>
      <p className="truncate text-brand-deep-purple">{plant.ageLabel ?? '—'}</p>
    </button>
  )
}

export default PlantTableRow
