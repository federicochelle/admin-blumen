export const PLANT_STAGES = [
  { value: 'GERMINACION', label: 'Germinacion' },
  { value: 'VEGETATIVO', label: 'Vegetativo' },
  { value: 'FLORACION', label: 'Floracion' },
  { value: 'SECADO', label: 'Secado' },
  { value: 'COSECHADA', label: 'Cosechada' },
  { value: 'DESCARTADA', label: 'Descartada' },
]

const PLANT_STAGE_LABELS = PLANT_STAGES.reduce((accumulator, stage) => {
  accumulator[stage.value] = stage.label
  return accumulator
}, {})

function toReadableText(value) {
  if (!value) {
    return 'Sin etapa'
  }

  return String(value)
    .trim()
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getPlantStageLabel(value) {
  if (!value) {
    return 'Sin etapa'
  }

  const normalized = String(value).trim().toUpperCase()
  return PLANT_STAGE_LABELS[normalized] ?? toReadableText(value)
}
