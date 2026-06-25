import { useState } from 'react'
import SectionHeader from '../components/shared/SectionHeader'
import { exportTraceabilityAuditWorkbook } from '../services/audit-export.service'

function Audit() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleExport() {
    setExporting(true)
    setError('')
    setSuccess('')

    try {
      await exportTraceabilityAuditWorkbook()
      setSuccess('El archivo Excel se genero correctamente.')
    } catch (exportError) {
      setError(exportError.message ?? 'No se pudo generar el Excel de auditoria.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Auditoria"
        title="Auditoria"
        description="Exportacion de datos para control e inspeccion."
      />

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Reporte de trazabilidad
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
              Exportacion Excel
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Genera un archivo descargable usando la plantilla de referencia y completando
              unicamente los datos reales equivalentes disponibles en Blumen.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              exporting
                ? 'cursor-wait bg-slate-300 text-white'
                : 'bg-slate-950 text-white hover:bg-slate-800'
            }`}
          >
            {exporting ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
      </section>
    </section>
  )
}

export default Audit
