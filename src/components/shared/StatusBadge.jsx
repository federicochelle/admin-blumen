const statusVariants = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function detectVariant(value) {
  const normalized = String(value ?? '').toLowerCase()

  if (['activo', 'active', 'ok', 'disponible', 'activa'].includes(normalized)) {
    return 'active'
  }

  if (['inactivo', 'inactive', 'cerrada', 'inactiva'].includes(normalized)) {
    return 'inactive'
  }

  if (['pendiente', 'warning', 'atencion'].includes(normalized)) {
    return 'warning'
  }

  if (['vacia', 'vacía'].includes(normalized)) {
    return 'inactive'
  }

  if (['estable'].includes(normalized)) {
    return 'info'
  }

  if (['completa', 'llena'].includes(normalized)) {
    return 'active'
  }

  return 'default'
}

function StatusBadge({ value }) {
  const variant = detectVariant(value)

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusVariants[variant]}`}
    >
      {value ?? 'Sin estado'}
    </span>
  )
}

export default StatusBadge
