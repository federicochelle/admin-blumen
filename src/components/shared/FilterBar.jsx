function FilterBar({ value, onChange, placeholder, summary }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <label className="flex items-center gap-3 rounded-2xl border border-brand-light-lilac/45 bg-white px-4 py-3 text-sm text-brand-deep-purple lg:min-w-[320px]">
        <span className="text-base text-brand-lavender">⌕</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent p-0 text-sm text-brand-deeper-purple outline-none placeholder:text-brand-lavender"
        />
      </label>
      <p className="text-sm text-brand-deep-purple">{summary}</p>
    </div>
  )
}

export default FilterBar
