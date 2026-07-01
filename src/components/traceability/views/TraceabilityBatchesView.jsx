import { useMemo, useState } from 'react'
import FilterBar from '../../shared/FilterBar'
import BatchDetailView from '../batches/BatchDetailView'
import BatchesListView from '../batches/BatchesListView'
import BatchFormView from '../batches/BatchFormView'

function TraceabilityBatchesView({
  batches,
  selectedBatchId,
  viewMode = 'list',
  loading,
  onRefresh,
  onNavigateList,
  onNavigateDetail,
  onNavigateCreate,
  onNavigateEdit,
}) {
  const [query, setQuery] = useState('')

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const haystack = [
        batch.code,
        batch.name,
        batch.strain,
        batch.status,
        batch.notes,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query.toLowerCase())
    })
  }, [batches, query])

  async function handleSaved(batchId) {
    await onRefresh?.()
    onNavigateDetail?.(batchId)
  }

  async function handleDeleted() {
    await onRefresh?.()
    onNavigateList?.()
  }

  return (
    <section className="space-y-5">
      {loading ? (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
          Cargando lotes...
        </div>
      ) : viewMode === 'detail' && selectedBatchId ? (
        <BatchDetailView
          batch={batches.find((batch) => String(batch.id) === String(selectedBatchId)) ?? null}
          batchId={selectedBatchId}
          onBack={onNavigateList}
          onEditBatch={onNavigateEdit}
          onDeleted={handleDeleted}
        />
      ) : viewMode === 'create' ? (
        <BatchFormView mode="create" onSaved={handleSaved} onCancel={onNavigateList} />
      ) : viewMode === 'edit' && selectedBatchId ? (
        <BatchFormView
          mode="edit"
          batchId={selectedBatchId}
          onSaved={handleSaved}
          onCancel={() => onNavigateDetail?.(selectedBatchId)}
        />
      ) : (
        <div className="min-w-0 rounded-[1.9rem] bg-slate-50/80">
          <BatchesListView
            batches={filteredBatches}
            selectedBatchId={selectedBatchId}
            onOpenBatch={onNavigateDetail}
            onEditBatch={onNavigateEdit}
            onDeleted={handleDeleted}
            onCreateBatch={onNavigateCreate}
            filterBar={
              <FilterBar
                value={query}
                onChange={setQuery}
                placeholder="Filtrar por codigo, nombre, variedad o estado"
                summary={`${filteredBatches.length} lotes encontrados`}
              />
            }
          />
        </div>
      )}
    </section>
  )
}

export default TraceabilityBatchesView
