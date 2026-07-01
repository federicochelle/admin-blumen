import PlantIcon from './PlantIcon'

function resolveTone(status) {
  const normalized = String(status ?? '').toLowerCase()

  if (normalized.includes('observ')) {
    return 'warning'
  }

  if (normalized.includes('incid') || normalized.includes('alert') || normalized.includes('error')) {
    return 'danger'
  }

  return 'active'
}

function resolveCardTone(tone) {
  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 hover:border-amber-300'
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 hover:border-rose-300'
  }

  return 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
}

function PlantSlot({
  plant,
  slot = null,
  empty = false,
  selected = false,
  selectedEmpty = false,
  onClick,
  onEmptyClick,
  selectedEmphasis = 'default',
  renderMetrics = null,
}) {
  const cellSizePx = renderMetrics?.cellSizePx ?? 44
  const plantIconSizePx = Math.max(cellSizePx - 2, 12)
  const slotSizeStyle = {
    width: `${cellSizePx}px`,
    height: `${cellSizePx}px`,
  }

  if (empty) {
    const isClickable = Boolean(
      onEmptyClick && Number.isInteger(slot?.rowIndex) && Number.isInteger(slot?.columnIndex),
    )

    return (
      <button
        type="button"
        disabled={!isClickable}
        onClick={() => {
          if (isClickable) {
            onEmptyClick(slot)
          }
        }}
        style={slotSizeStyle}
        className={`group/slot relative flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition duration-150 ${
          isClickable
            ? 'hover:scale-110 hover:border-forest-400 hover:bg-forest-100 hover:shadow-[0_8px_24px_rgba(34,197,94,0.18)]'
            : ''
        } ${
          isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
        } ${selectedEmpty ? 'border-forest-600 bg-forest-100 ring-4 ring-forest-200 shadow-[0_10px_28px_rgba(34,197,94,0.22)]' : ''}`}
        title="Agregar planta"
      >
        <span className={`text-sm font-semibold text-slate-300 opacity-100 transition duration-150 ${
          isClickable
            ? '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/slot:opacity-100 [@media(hover:hover)]:group-hover/slot:text-forest-700'
            : ''
        }`}>
          +
        </span>
        <span className={`pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-10 w-max -translate-x-1/2 translate-y-1 rounded-full border border-forest-200 bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-forest-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition duration-150 ${
          isClickable
            ? 'opacity-0 group-hover/slot:-translate-y-1 group-hover/slot:opacity-100'
            : 'hidden'
        }`}>
          Agregar planta
        </span>
      </button>
    )
  }

  const selectedClasses =
    selectedEmphasis === 'strong'
      ? 'border-forest-600 ring-4 ring-forest-200 shadow-[0_8px_24px_rgba(34,197,94,0.18)]'
      : 'border-forest-500 ring-2 ring-forest-200'
  const tone = resolveTone(plant.status)
  const toneClasses = resolveCardTone(tone)

  return (
    <button
      type="button"
      onClick={() => onClick?.(plant)}
      style={slotSizeStyle}
      className={`flex items-center justify-center rounded-2xl border shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition duration-150 hover:scale-110 ${
        selected ? `${toneClasses} ${selectedClasses}` : toneClasses
      }`}
      title={plant.code ?? 'Planta'}
    >
      <PlantIcon tone={tone} sizePx={plantIconSizePx} />
    </button>
  )
}

export default PlantSlot
