import EmptyState from '../../shared/EmptyState'
import SectionHeader from '../../shared/SectionHeader'
import StatCard from '../../shared/StatCard'

function AlertBadge({ severity }) {
  const styles = {
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[severity] ?? styles.default
      }`}
    >
      {severity}
    </span>
  )
}

function TraceabilityOverview({ overviewDashboard }) {
  const {
    kpis,
    plantsByStage,
    roomOccupancy,
    recentEvents,
    recentIrrigations,
    alerts,
  } = overviewDashboard

  return (
    <section className="space-y-5">
      <SectionHeader
        eyebrow="Vista general"
        title="Centro de control operativo"
        description="Lectura consolidada del cultivo usando datos reales de salas, zonas, plantas, eventos y riegos."
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <StatCard title="Salas" value={kpis.totalRooms} tone="muted" />
        <StatCard title="Zonas" value={kpis.totalBeds} />
        <StatCard title="Plantas" value={kpis.totalPlants} tone="accent" />
        <StatCard title="Eventos" value={kpis.totalEvents} />
        <StatCard title="Riegos" value={kpis.totalIrrigations} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                Estado del cultivo
              </p>
              <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Plantas por etapa
              </h4>
            </div>
          </div>

          {plantsByStage.length > 0 ? (
            <div className="mt-5 space-y-3">
              {plantsByStage.map((item) => (
                <article
                  key={item.stage}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{item.stage}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.count} plantas</p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">
                      {item.percentage}%
                    </p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-forest-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                compact
                title="No hay plantas registradas todavía."
                description="Cuando existan plantas, esta vista mostrara su distribucion real por etapa."
              />
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
                Ocupacion de salas
              </p>
              <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                Capacidad y uso actual
              </h4>
            </div>
          </div>

          {roomOccupancy.length > 0 ? (
            <div className="mt-5 space-y-3">
              {roomOccupancy.map((room) => (
                <article
                  key={room.roomId}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{room.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{room.type ?? 'Sin tipo'}</p>
                    </div>
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">
                      {room.occupancyPercentage}%
                    </p>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-950"
                      style={{ width: `${room.occupancyPercentage}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{room.totalPlants} plantas</span>
                    <span>{room.totalBeds} zonas</span>
                    <span>Capacidad {room.capacity}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                compact
                title="No hay salas registradas todavía."
                description="Cuando existan salas y zonas se mostrara su ocupacion real."
              />
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Actividad reciente
            </p>
            <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              Ultimos eventos
            </h4>
          </div>

          {recentEvents.length > 0 ? (
            <div className="mt-5 space-y-3">
              {recentEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {event.event_type ?? 'Sin tipo'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {event.description ?? 'Sin descripcion'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">{event.event_date ?? 'Sin fecha'}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>{event.plant_code ?? 'Sin planta'}</span>
                    <span>{event.room_name ?? 'Sin sala'}</span>
                    <span>{event.bed_code ?? 'Sin zona'}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                compact
                title="No hay eventos registrados todavía."
                description="Los ultimos movimientos del cultivo apareceran aqui cuando existan registros en plant_events."
              />
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">
              Ultimos riegos
            </p>
            <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
              Registros recientes
            </h4>
          </div>

          {recentIrrigations.length > 0 ? (
            <div className="mt-5 space-y-3">
              {recentIrrigations.map((irrigation) => (
                <article
                  key={irrigation.id}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {irrigation.room_name ?? 'Sin sala'} · {irrigation.bed_code ?? 'Sin zona'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {irrigation.notes ?? 'Sin notas'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {irrigation.irrigation_date ?? 'Sin fecha'}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>pH {irrigation.ph ?? 'N/D'}</span>
                    <span>EC {irrigation.ec ?? 'N/D'}</span>
                    <span>Litros {irrigation.liters ?? 'N/D'}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                compact
                title="No hay riegos registrados todavía."
                description="Los ultimos riegos apareceran aqui cuando existan registros en irrigations."
              />
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-700">Alertas</p>
          <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Focos operativos detectados
          </h4>
        </div>

        {alerts.length > 0 ? (
          <div className="mt-5 grid gap-3 xl:grid-cols-4">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{alert.label}</p>
                  <AlertBadge severity={alert.severity} />
                </div>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {alert.count}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              compact
              title="Sin alertas detectadas con los datos actuales."
              description="No se encontraron ausencias de plantas, eventos o riegos en los criterios definidos."
            />
          </div>
        )}
      </section>
    </section>
  )
}

export default TraceabilityOverview
