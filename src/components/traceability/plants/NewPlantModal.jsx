import { useEffect, useState } from 'react'
import { createPlant, getPlantBatches, getStrains } from '../../../services/traceability.service'

function InlineFormMessage({ message }) {
  if (!message) {
    return null
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

function NewPlantModal({ open, slot, onClose, onCreated }) {
  const [strains, setStrains] = useState([])
  const [batches, setBatches] = useState([])
  const [loadingStrains, setLoadingStrains] = useState(false)
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({
    code: '',
    strain_id: '',
    batch_id: '',
    notes: '',
  })

  function resetFormState() {
    setSubmitError('')
    setForm({
      code: '',
      strain_id: '',
      batch_id: '',
      notes: '',
    })
  }

  function handleClose() {
    resetFormState()
    onClose?.()
  }

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function loadCatalogs() {
      setLoadingStrains(true)
      setLoadingBatches(true)
      setCatalogError('')

      try {
        const [strainData, batchData] = await Promise.all([getStrains(), getPlantBatches()])

        if (cancelled) {
          return
        }

        setStrains(strainData)
        setBatches(batchData)
      } catch (error) {
        if (cancelled) {
          return
        }

        setStrains([])
        setBatches([])
        setCatalogError(error.message ?? 'No se pudieron cargar los datos del formulario.')
      } finally {
        if (!cancelled) {
          setLoadingStrains(false)
          setLoadingBatches(false)
        }
      }
    }

    loadCatalogs()

    return () => {
      cancelled = true
    }
  }, [open])

  if (!slot) {
    return null
  }

  const roomName = slot.room?.name ?? 'Sin sala'
  const zoneCode = slot.bed?.code ?? slot.bed?.name ?? 'Sin zona'

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!form.code.trim()) {
      setSubmitError('El codigo de la planta es obligatorio.')
      return
    }

    if (!form.strain_id) {
      setSubmitError('La genetica es obligatoria.')
      return
    }

    setSaving(true)

    try {
      await createPlant({
        code: form.code,
        strain_id: form.strain_id ? Number(form.strain_id) : null,
        batch_id: form.batch_id || null,
        bed_id: slot.bed.id,
        row_index: slot.rowIndex,
        column_index: slot.columnIndex,
        notes: form.notes,
        event_description: `Se creó la planta ${form.code.trim()} en la sala ${roomName}, zona ${zoneCode}, fila ${slot.rowIndex + 1}, columna ${slot.columnIndex + 1}.`,
      })

      await onCreated?.()
      handleClose()
    } catch (error) {
      setSubmitError(error.message ?? 'No se pudo crear la planta.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar modal de nueva planta"
        onClick={handleClose}
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
        <section className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-4 pb-1">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Nueva planta
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
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
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Codigo</span>
                <input
                  type="text"
                  value={form.code}
                  required
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, code: formEvent.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Genetica</span>
                <select
                  value={form.strain_id}
                  required
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, strain_id: formEvent.target.value }))
                  }
                  disabled={loadingStrains}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">{loadingStrains ? 'Cargando geneticas...' : 'Selecciona una genetica'}</option>
                  {strains.map((strain) => (
                    <option key={strain.id} value={strain.id}>
                      {strain.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Lote</span>
                <select
                  value={form.batch_id}
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, batch_id: formEvent.target.value }))
                  }
                  disabled={loadingBatches}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">{loadingBatches ? 'Cargando lotes...' : 'Sin lote'}</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name ? `${batch.code} · ${batch.name}` : batch.code}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Observacion</span>
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(formEvent) =>
                    setForm((current) => ({ ...current, notes: formEvent.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                />
              </label>
            </div>

            <InlineFormMessage message={catalogError || submitError} />

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Creando...' : 'Crear planta'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default NewPlantModal
