import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../../shared/EmptyState'
import PlantTable from '../plants/PlantTable'
import { useTraceabilityData } from '../../../hooks/useTraceabilityData'
import { deletePlantBatch, registerBatchHarvest } from '../../../services/traceability.service'
import { exportTraceabilityAuditWorkbookByBatch } from '../../../services/audit-export.service'
import { formatBatchDate, toLocalNoonIso } from './batchForm.utils'

function ActionButton({
  label,
  onClick,
  tone = 'default',
  disabled = false,
  title = undefined,
  icon,
}) {
  const tones = {
    default:
      'border-brand-deep-purple bg-brand-deep-purple text-white hover:border-brand-deeper-purple hover:bg-brand-deeper-purple',
    primary:
      'border-brand-turquoise bg-brand-turquoise text-white hover:border-brand-deep-purple hover:bg-brand-deep-purple',
    secondary:
      'border-brand-lavender bg-brand-light-lilac text-brand-deep-purple hover:border-brand-deep-purple hover:bg-brand-lavender/30',
    destructive:
      'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${
        disabled
          ? 'cursor-not-allowed border-brand-lavender/45 bg-brand-light-lilac/55 text-brand-deep-purple/55'
          : tones[tone]
      }`}
      aria-label={label}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/0 bg-white/35 px-4 py-3 backdrop-blur-[1px]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-2 text-sm text-slate-900">{value}</div>
    </div>
  )
}

function BatchHarvestModal({ open, batchCode, form, saving, error, onClose, onChange, onSubmit }) {
  return (
    <>
      <button
        type="button"
        aria-label="Cerrar modal de cosecha por lote"
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
                Registrar cosecha
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {batchCode ?? 'Lote'}
              </h3>
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

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Fecha de cosecha</span>
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(event) => onChange('harvest_date', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Peso seco total (g)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total_dry_weight}
                  onChange={(event) => onChange('total_dry_weight', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Observaciones</span>
                <textarea
                  rows="4"
                  value={form.notes}
                  onChange={(event) => onChange('notes', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-forest-400"
                  placeholder="Opcional"
                />
              </label>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Registrando...' : 'Confirmar cosecha'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

function BatchDetailView({ batch, batchId, onEditBatch, onDeleted, onUpdated }) {
  const navigate = useNavigate()
  const { traceability, loading, error, loadTraceability } = useTraceabilityData()
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showHarvestModal, setShowHarvestModal] = useState(false)
  const [harvesting, setHarvesting] = useState(false)
  const [harvestError, setHarvestError] = useState('')
  const [harvestForm, setHarvestForm] = useState({
    harvest_date: '',
    total_dry_weight: '',
    notes: '',
  })

  const associatedPlants = useMemo(
    () =>
      traceability.plantRows.filter(
        (plantRow) => String(plantRow.batchId ?? '') === String(batchId),
      ),
    [batchId, traceability.plantRows],
  )

  const plantsListHeader = (
    <div className="space-y-1">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
        Plantas asociadas
      </p>
      <p className="text-sm text-slate-500">
        {associatedPlants.length} plantas vinculadas a este lote.
      </p>
    </div>
  )

  function resetHarvestForm() {
    setHarvestError('')
    setHarvestForm({
      harvest_date: '',
      total_dry_weight: '',
      notes: '',
    })
  }

  function handleOpenHarvestModal() {
    setActionError('')
    setActionSuccess('')
    resetHarvestForm()
    setShowHarvestModal(true)
  }

  function handleCloseHarvestModal() {
    if (harvesting) {
      return
    }

    setShowHarvestModal(false)
    resetHarvestForm()
  }

  async function handleExport() {
    setActionError('')
    setActionSuccess('')
    setExporting(true)

    try {
      await exportTraceabilityAuditWorkbookByBatch(batchId)
      setActionSuccess('El Excel del lote se exporto correctamente.')
    } catch (exportError) {
      setActionError(exportError.message ?? 'No se pudo exportar el Excel del lote.')
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    if (!batch?.id) {
      return
    }

    const confirmed = window.confirm(
      `¿Eliminar este lote?\n\nLas plantas NO serán eliminadas.\nSimplemente dejarán de pertenecer a este lote.`,
    )

    if (!confirmed) {
      return
    }

    setActionError('')
    setActionSuccess('')
    setDeleting(true)

    try {
      await deletePlantBatch(batch.id)
      await onDeleted?.(batch.id)
    } catch (deleteError) {
      setActionError(deleteError.message ?? 'No se pudo eliminar el lote.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleHarvestSubmit(event) {
    event.preventDefault()
    setHarvestError('')
    setActionError('')
    setActionSuccess('')

    if (!batch?.id) {
      setHarvestError('No se encontro el lote a cosechar.')
      return
    }

    if (!harvestForm.harvest_date) {
      setHarvestError('La fecha de cosecha es obligatoria.')
      return
    }

    const harvestDateIso = toLocalNoonIso(harvestForm.harvest_date)

    if (!harvestDateIso) {
      setHarvestError('La fecha de cosecha seleccionada no es valida.')
      return
    }

    const totalDryWeight = Number(harvestForm.total_dry_weight)

    if (!Number.isFinite(totalDryWeight) || totalDryWeight <= 0) {
      setHarvestError('El peso seco total debe ser un numero mayor a 0.')
      return
    }

    setHarvesting(true)

    try {
      const result = await registerBatchHarvest({
        batch_id: batch.id,
        event_date: harvestDateIso,
        total_dry_weight: totalDryWeight,
        notes: harvestForm.notes,
      })

      await loadTraceability()
      await onUpdated?.(batch.id)
      setActionSuccess(
        `Cosecha registrada para ${result.plantsCount} plantas. Peso promedio asignado: ${result.averageHarvestWeight} g.`,
      )
      setShowHarvestModal(false)
      resetHarvestForm()
    } catch (submitError) {
      setHarvestError(submitError.message ?? 'No se pudo registrar la cosecha del lote.')
    } finally {
      setHarvesting(false)
    }
  }

  if (!batch) {
    return (
      <EmptyState
        title="No se encontro el lote"
        description="El lote solicitado no existe o ya no esta disponible."
      />
    )
  }

  return (
    <section className="space-y-5">
      {actionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {actionSuccess ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionSuccess}
        </div>
      ) : null}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Ficha de lote
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {batch.code ?? 'Lote'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              label="Registrar cosecha"
              tone="primary"
              onClick={handleOpenHarvestModal}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 14c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5Z" />
                  <path d="M12 9V5" />
                  <path d="M12 5c1.5 0 3 .5 4 2" />
                </svg>
              }
            />
            <ActionButton
              label="Editar"
              tone="default"
              onClick={() => onEditBatch?.(batch.id)}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
                  <path d="M13.5 6.5l4 4" />
                </svg>
              }
            />
            <ActionButton
              label={exporting ? 'Exportando...' : 'Exportar Excel'}
              tone="secondary"
              onClick={handleExport}
              disabled={exporting}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              }
            />
            <ActionButton
              label={deleting ? 'Eliminando...' : 'Eliminar'}
              tone="destructive"
              onClick={handleDelete}
              disabled={deleting}
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                  <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              }
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <DetailField label="Fecha inicio" value={formatBatchDate(batch.startedAtRaw)} />
          <DetailField label="Plantas asociadas" value={String(associatedPlants.length)} />
          <div className="md:col-span-2">
            <DetailField label="Notas" value={batch.notes ?? 'Sin notas'} />
          </div>
        </div>
      </section>

      {loading ? (
        <section className="rounded-[1.5rem] border border-brand-light-lilac/40 bg-white/85 p-4 shadow-[0_12px_30px_rgba(91,70,111,0.08)] sm:p-5">
          <div className="border-b border-brand-light-lilac/35 pb-4">{plantsListHeader}</div>
          <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            Cargando plantas asociadas...
          </div>
        </section>
      ) : error ? (
        <section className="rounded-[1.5rem] border border-brand-light-lilac/40 bg-white/85 p-4 shadow-[0_12px_30px_rgba(91,70,111,0.08)] sm:p-5">
          <div className="border-b border-brand-light-lilac/35 pb-4">{plantsListHeader}</div>
          <div className="mt-4">
            <EmptyState title="No se pudieron cargar las plantas" description={error} compact />
          </div>
        </section>
      ) : associatedPlants.length > 0 ? (
        <PlantTable
          plants={associatedPlants}
          selectedPlantId={null}
          onSelectPlant={(plant) => navigate(`/plantas?view=detail&plant=${plant.id}`)}
          filterBar={plantsListHeader}
        />
      ) : (
        <section className="rounded-[1.5rem] border border-brand-light-lilac/40 bg-white/85 p-4 shadow-[0_12px_30px_rgba(91,70,111,0.08)] sm:p-5">
          <div className="border-b border-brand-light-lilac/35 pb-4">{plantsListHeader}</div>
          <div className="mt-4">
            <EmptyState
              compact
              title="Este lote no tiene plantas asociadas."
              description="Cuando vincules plantas a este lote apareceran en este listado."
            />
          </div>
        </section>
      )}

      <BatchHarvestModal
        open={showHarvestModal}
        batchCode={batch.code}
        form={harvestForm}
        saving={harvesting}
        error={harvestError}
        onClose={handleCloseHarvestModal}
        onChange={(field, value) => setHarvestForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleHarvestSubmit}
      />
    </section>
  )
}

export default BatchDetailView
