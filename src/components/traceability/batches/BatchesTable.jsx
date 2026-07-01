import BatchTableRow from './BatchTableRow'

function BatchesTable({ batches, selectedBatchId, onOpenBatch }) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px] space-y-2">
        <div className="grid grid-cols-[1.2fr_1fr_0.9fr] gap-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span>Codigo</span>
          <span>Fecha inicio</span>
          <span>Plantas asociadas</span>
        </div>

        <div className="space-y-2">
          {batches.map((batch) => (
            <BatchTableRow
              key={batch.id}
              batch={batch}
              selected={batch.id === selectedBatchId}
              onOpenBatch={onOpenBatch}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default BatchesTable
