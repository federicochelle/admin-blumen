import EmptyState from '../../shared/EmptyState'
import SectionHeader from '../../shared/SectionHeader'

function TraceabilityEventsView() {
  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Eventos"
        title="Vista analitica de eventos"
        description="Queda reservada para una siguiente iteracion de exploracion transversal."
      />
      <EmptyState
        title="Eventos proximamente"
        description="La lectura actual ya usa plant_events para salas y plantas, pero esta vista dedicada todavia esta en desarrollo."
      />
    </section>
  )
}

export default TraceabilityEventsView
