import EmptyState from '../../shared/EmptyState'
import BatchesTable from './BatchesTable'

function BatchesListView({
  batches,
  selectedBatchId,
  onOpenBatch,
  onCreateBatch,
  filterBar = null,
}) {
  return (
    <section className="space-y-5 rounded-[1.9rem] bg-slate-50/80">
      <section className="space-y-4 rounded-[1.5rem] border border-brand-light-lilac/40 bg-white/85 p-4 shadow-[0_12px_30px_rgba(91,70,111,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-brand-light-lilac/35 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">{filterBar}</div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCreateBatch}
              className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple"
            >
              + Nuevo lote
            </button>
          </div>
        </div>

        {batches.length > 0 ? (
          <BatchesTable
            batches={batches}
            selectedBatchId={selectedBatchId}
            onOpenBatch={onOpenBatch}
          />
        ) : (
          <EmptyState
            compact
            title="No hay lotes registrados."
            description="Cuando cargues lotes de plantas apareceran en esta tabla."
          />
        )}
      </section>
    </section>
  )
}

export default BatchesListView
