import EmptyState from '../../shared/EmptyState'
import RoomTable from './RoomTable'
import RoomTypeFilters from './RoomTypeFilters'

function RoomsListView({
  activeFilter,
  filters,
  filteredRooms,
  selectedRoomId,
  onChangeFilter,
  onSelectRoom,
  onCreateRoom,
}) {
  return (
    <section className="space-y-5 rounded-[1.9rem] bg-slate-50/80">
      <section className="space-y-4 rounded-[1.5rem] border border-brand-light-lilac/40 bg-white/85 p-4 shadow-[0_12px_30px_rgba(91,70,111,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-brand-light-lilac/35 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <RoomTypeFilters
            filters={filters}
            activeFilter={activeFilter}
            onChange={onChangeFilter}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCreateRoom}
              className="rounded-xl bg-brand-turquoise px-3.5 py-2 text-sm font-medium text-white transition hover:bg-brand-deep-purple"
            >
              + Nueva sala
            </button>
          </div>
        </div>

        {filteredRooms.length > 0 ? (
          <RoomTable
            rooms={filteredRooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={onSelectRoom}
          />
        ) : (
          <EmptyState
            compact
            title="No hay salas registradas."
            description="No se encontraron salas para el filtro seleccionado."
          />
        )}
      </section>
    </section>
  )
}

export default RoomsListView
