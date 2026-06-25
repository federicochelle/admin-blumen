import EmptyState from '../../shared/EmptyState'
import PlantEventsBlock from './PlantEventsBlock'
import PlantInfoCard from './PlantInfoCard'
import PlantIrrigationsBlock from './PlantIrrigationsBlock'
import PlantVisualTimeline from './PlantVisualTimeline'

function PlantDetailPanel({ plant }) {
  if (!plant) {
    return (
      <EmptyState
        title="Selecciona una planta"
        description="Al elegir una fila de la tabla podras inspeccionar sus eventos, riegos y observaciones."
      />
    )
  }

  return (
    <aside className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-[#f7f5f1] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <PlantInfoCard plant={plant} />

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Timeline</p>
          <p className="mt-1 text-sm text-slate-500">Secuencia real de eventos de la planta.</p>
        </div>
        <PlantVisualTimeline events={plant.events} />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Eventos</p>
          <p className="mt-1 text-sm text-slate-500">Registros obtenidos desde plant_events.</p>
        </div>
        <PlantEventsBlock events={plant.events} />
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Riegos</p>
          <p className="mt-1 text-sm text-slate-500">Relacionados a la zona asignada.</p>
        </div>
        <PlantIrrigationsBlock irrigations={plant.irrigations} />
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay-700">
          Observaciones
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {plant.notes ?? 'No hay observaciones registradas para esta planta.'}
        </p>
      </section>
    </aside>
  )
}

export default PlantDetailPanel
