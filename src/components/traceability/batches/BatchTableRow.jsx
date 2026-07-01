import { formatBatchDate } from './batchForm.utils'

function BatchTableRow({ batch, selected, onOpenBatch }) {
  function handleOpenBatch() {
    onOpenBatch?.(batch.id)
  }

  function handleRowKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpenBatch()
    }
  }

  return (
    <div
      className={`grid grid-cols-[1.2fr_1fr_0.9fr] items-center gap-3 rounded-[1.1rem] border px-3 py-3 text-sm transition ${
        selected
          ? 'border-brand-lavender bg-brand-light-lilac/22 shadow-[0_10px_22px_rgba(91,70,111,0.12)]'
          : 'border-brand-light-lilac/35 bg-white hover:border-brand-lavender hover:bg-brand-light-lilac/12'
      } cursor-pointer`}
      role="button"
      tabIndex={0}
      onClick={handleOpenBatch}
      onKeyDown={handleRowKeyDown}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-brand-deeper-purple">{batch.code}</p>
      </div>
      <p className="truncate text-brand-deep-purple">{formatBatchDate(batch.startedAtRaw)}</p>
      <p className="truncate text-brand-deep-purple">{batch.plantCount}</p>
    </div>
  )
}

export default BatchTableRow
