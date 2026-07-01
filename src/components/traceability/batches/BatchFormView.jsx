import { useEffect, useState } from 'react'
import EmptyState from '../../shared/EmptyState'
import {
  createPlantBatch,
  getPlantBatchById,
  updatePlantBatch,
} from '../../../services/traceability.service'
import {
  formatDateInputFromValue,
  toLocalNoonIso,
} from './batchForm.utils'

function buildFormState(batch) {
  return {
    code: batch?.code ?? '',
    name: batch?.name ?? '',
    started_at: formatDateInputFromValue(batch?.startedAtRaw),
    status: batch?.status ?? 'ACTIVE',
    notes: batch?.notes ?? '',
  }
}

function BatchFormView({ mode, batchId, onSaved, onCancel }) {
  const [form, setForm] = useState(() => buildFormState(null))
  const [loading, setLoading] = useState(mode === 'edit')
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadFormData() {
      setLoading(mode === 'edit')
      setLoadError('')

      try {
        const batchData = mode === 'edit' && batchId ? await getPlantBatchById(batchId) : null

        if (cancelled) {
          return
        }

        if (mode === 'edit' && batchData) {
          setForm(buildFormState(batchData))
        } else if (mode === 'create') {
          setForm(buildFormState(null))
        }
      } catch (error) {
        if (cancelled) {
          return
        }

        setLoadError(error.message ?? 'No se pudo cargar el formulario del lote.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFormData()

    return () => {
      cancelled = true
    }
  }, [batchId, mode])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!form.code.trim()) {
      setSubmitError('El codigo del lote es obligatorio.')
      return
    }

    if (!form.status) {
      setSubmitError('El estado del lote es obligatorio.')
      return
    }

    const startedAtIso = form.started_at ? toLocalNoonIso(form.started_at) : null

    if (form.started_at && !startedAtIso) {
      setSubmitError('La fecha de inicio seleccionada no es valida.')
      return
    }

    setSaving(true)

    try {
      const payload = {
        code: form.code,
        name: form.name,
        started_at: startedAtIso,
        status: form.status,
        notes: form.notes,
      }

      const savedBatch =
        mode === 'edit' && batchId
          ? await updatePlantBatch(batchId, payload)
          : await createPlantBatch(payload)

      await onSaved?.(savedBatch.id)
    } catch (error) {
      setSubmitError(error.message ?? 'No se pudo guardar el lote.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
        Cargando lote...
      </div>
    )
  }

  if (loadError) {
    return <EmptyState title="No se pudo cargar el lote" description={loadError} />
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {mode === 'edit' ? 'Editar lote' : 'Nuevo lote'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {mode === 'edit' ? form.code || 'Lote' : 'Registrar lote'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-brand-lavender/45 px-3.5 py-2 text-sm font-medium text-brand-deeper-purple transition hover:border-brand-deep-purple hover:bg-brand-light-lilac/16"
        >
          Volver al listado
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Codigo</span>
            <input
              type="text"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              className="w-full rounded-xl border border-brand-lavender/45 bg-white px-3 py-2.5 text-sm text-brand-deeper-purple outline-none transition focus:border-brand-deep-purple"
              placeholder="Ej. LOT-001"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Fecha inicio</span>
            <input
              type="date"
              value={form.started_at}
              onChange={(event) =>
                setForm((current) => ({ ...current, started_at: event.target.value }))
              }
              className="w-full rounded-xl border border-brand-lavender/45 bg-white px-3 py-2.5 text-sm text-brand-deeper-purple outline-none transition focus:border-brand-deep-purple"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Notas</span>
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              rows={5}
              className="w-full rounded-xl border border-brand-lavender/45 bg-white px-3 py-2.5 text-sm text-brand-deeper-purple outline-none transition focus:border-brand-deep-purple"
              placeholder="Observaciones opcionales"
            />
          </label>
        </div>

        {submitError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-brand-lavender/45 px-4 py-2.5 text-sm font-medium text-brand-deeper-purple transition hover:border-brand-deep-purple hover:bg-brand-light-lilac/16"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand-turquoise px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear lote'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default BatchFormView
