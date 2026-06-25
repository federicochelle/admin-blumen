import EmptyState from '../../shared/EmptyState'
import SectionHeader from '../../shared/SectionHeader'

function TraceabilityIrrigationsView() {
  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Riegos"
        title="Vista analitica de riegos"
        description="Preparada para evolucionar a seguimiento historico por sala, zona y planta."
      />
      <EmptyState
        title="Riegos proximamente"
        description="La lectura actual ya usa irrigations para paneles y metricas, pero esta vista transversal todavia no esta implementada."
      />
    </section>
  )
}

export default TraceabilityIrrigationsView
