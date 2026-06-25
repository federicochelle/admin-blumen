function RoomTypeFilters({ filters, activeFilter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = filter.value === activeFilter

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'border-brand-deep-purple bg-brand-deep-purple text-white shadow-[0_8px_18px_rgba(61,45,79,0.22)]'
                : 'border-brand-light-lilac/50 bg-white/70 text-brand-deep-purple hover:border-brand-lavender hover:bg-brand-light-lilac/20 hover:text-brand-deeper-purple'
            }`}
          >
            <span>{filter.label}</span>
            <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isActive ? 'bg-white/18 text-white' : 'bg-brand-light-lilac/25 text-brand-deep-purple'
            }`}>
              {filter.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default RoomTypeFilters
