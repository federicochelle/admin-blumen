import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Breadcrumbs from '../components/shared/Breadcrumbs'
import EmptyState from '../components/shared/EmptyState'
import PageHeader from '../components/shared/PageHeader'
import TraceabilityBatchesView from '../components/traceability/views/TraceabilityBatchesView'
import { getPlantBatches } from '../services/traceability.service'

function Batches() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedBatchIdParam = searchParams.get('batch')
  const viewMode = searchParams.get('view') ?? (selectedBatchIdParam ? 'detail' : 'list')
  const selectedBatchId = selectedBatchIdParam ?? null
  const selectedBatch =
    batches.find((batch) => String(batch.id) === String(selectedBatchId)) ?? null

  useEffect(() => {
    let cancelled = false

    async function loadInitialBatches() {
      try {
        const data = await getPlantBatches()

        if (cancelled) {
          return
        }

        setBatches(data)
        setError('')
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(loadError.message ?? 'No se pudieron cargar los lotes.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadInitialBatches()

    return () => {
      cancelled = true
    }
  }, [])

  const loadBatches = useCallback(async () => {
    setLoading(true)

    try {
      const data = await getPlantBatches()
      setBatches(data)
      setError('')
    } catch (loadError) {
      setError(loadError.message ?? 'No se pudieron cargar los lotes.')
    } finally {
      setLoading(false)
    }
  }, [])

  function navigateToList() {
    navigate('/lotes')
  }

  function navigateToCreate() {
    navigate('/lotes?view=create')
  }

  function navigateToDetail(batchId) {
    navigate(`/lotes?view=detail&batch=${batchId}`)
  }

  function navigateToEdit(batchId) {
    navigate(`/lotes?view=edit&batch=${batchId}`)
  }

  let breadcrumbItems = [{ label: 'Lotes' }]

  if (viewMode === 'create') {
    breadcrumbItems = [
      { label: 'Lotes', onClick: navigateToList },
      { label: 'Nuevo lote' },
    ]
  } else if (viewMode === 'detail' && selectedBatch) {
    breadcrumbItems = [
      { label: 'Lotes', onClick: navigateToList },
      { label: selectedBatch.code ?? 'Lote' },
    ]
  } else if (viewMode === 'edit' && selectedBatch) {
    breadcrumbItems = [
      { label: 'Lotes', onClick: navigateToList },
      { label: selectedBatch.code ?? 'Lote', onClick: () => navigateToDetail(selectedBatch.id) },
      { label: 'Editar' },
    ]
  }

  return (
    <div>
      <PageHeader>
        <Breadcrumbs items={breadcrumbItems} />
      </PageHeader>

      {error ? (
        <EmptyState title="No se pudieron cargar los lotes" description={error} />
      ) : (
        <TraceabilityBatchesView
          batches={batches}
          selectedBatchId={selectedBatchId}
          viewMode={viewMode}
          loading={loading}
          onRefresh={loadBatches}
          onNavigateList={navigateToList}
          onNavigateDetail={navigateToDetail}
          onNavigateCreate={navigateToCreate}
          onNavigateEdit={navigateToEdit}
        />
      )}
    </div>
  )
}

export default Batches
