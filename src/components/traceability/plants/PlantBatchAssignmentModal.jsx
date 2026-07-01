import { useEffect, useState } from 'react'
import {
  getPlantBatches,
  updatePlantBatchAssignment,
} from '../../../services/traceability.service'

function buildBatchOptionLabel(batch) {
  if (batch?.code && batch?.name) {
    return `${batch.code} · ${batch.name}`
  }

  return batch?.code ?? batch?.name ?? 'Lote sin nombre'
}

function PlantBatchAssignmentModal({ open, plant, onClose, onUpdated }) {
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState(plant?.batchId ? String(plant.batchId) : '')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function loadBatches() {
      setLoading(true)
      setError('')
      setSelectedBatchId(plant?.batchId ? String(plant.batchId) : '')

      try {
        const data = await getPlantBatches()

        if (cancelled) {
          return
        }

        setBatches(data)
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setBatches([])
        setError(loadError.message ?? 'No se pudo cargar la lista de lotes.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadBatches()

    return () => {
      cancelled = true
    }
  }, [open, plant?.batchId])

  if (!plant) {
    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      await updatePlantBatchAssignment(plant.id, selectedBatchId || null)
      await onUpdated?.()
      onClose?.()
    } catch (submitError) {
      setError(submitError.message ?? 'No se pudo actualizar el lote de la planta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar modal de lote"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-slate-950/30 transition-opacity duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed inset-0 z-[70] flex items-center justify-center p-4 transition duration-200 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <section className="w-full max-w-xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Editar lote
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {plant.code}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-lavender/55 bg-brand-deep-purple text-white transition hover:border-brand-deeper-purple hover:bg-brand-deeper-purple"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12" />
                <path d="M18 6 6 18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Lote actual: <span className="font-semibold text-slate-950">{plant.batchLabel ?? 'Sin lote'}</span>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Seleccionar lote</span>
              <select
                value={selectedBatchId}
                onChange={(event) => setSelectedBatchId(event.target.value)}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{loading ? 'Cargando lotes...' : 'Sin lote'}</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {buildBatchOptionLabel(batch)}
                  </option>
                ))}
              </select>
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-brand-lavender/45 px-4 py-2.5 text-sm font-medium text-brand-deeper-purple transition hover:border-brand-deep-purple hover:bg-brand-light-lilac/16"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-xl bg-brand-turquoise px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Guardando...' : 'Guardar lote'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default PlantBatchAssignmentModal
