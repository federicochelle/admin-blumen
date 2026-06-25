function RoomTableRow({ room, selected, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(room.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(room.id)
        }
      }}
      className={`grid w-full cursor-pointer grid-cols-[1.9fr_1fr_0.8fr_0.8fr_0.9fr] items-center gap-3 rounded-[1.1rem] border px-3 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-light-lilac ${
        selected
          ? 'border-brand-lavender bg-brand-light-lilac/22 shadow-[0_10px_22px_rgba(91,70,111,0.12)]'
          : 'border-brand-light-lilac/35 bg-white hover:border-brand-lavender hover:bg-brand-light-lilac/12'
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-brand-deeper-purple">{room.name}</p>
      </div>
      <p className="truncate text-brand-deep-purple">{room.type}</p>
      <p className="text-right font-medium text-brand-deep-purple">{room.totalPlants}</p>
      <p className="text-right font-medium text-brand-deep-purple">{room.totalBeds}</p>
      <p className="text-right font-semibold text-brand-deeper-purple">{room.occupancyPercentage}%</p>
    </div>
  )
}

export default RoomTableRow
