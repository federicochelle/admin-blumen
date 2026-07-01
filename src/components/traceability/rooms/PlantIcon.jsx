import plantLogo from '../../../../logo.webp'

function PlantIcon({ tone = 'active', sizePx = 32 }) {
  const tones = {
    active: 'bg-emerald-50',
    warning: 'bg-amber-50',
    danger: 'bg-rose-50',
  }

  return (
    <span
      className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ${
        tones[tone] ?? tones.active
      }`}
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
      }}
      aria-hidden="true"
    >
      <img src={plantLogo} alt="" className="h-full w-full object-contain" />
    </span>
  )
}

export default PlantIcon
