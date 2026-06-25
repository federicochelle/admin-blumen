import EmptyState from '../../shared/EmptyState'
import RoomTableRow from './RoomTableRow'

function RoomTable({ rooms, selectedRoomId, onSelectRoom }) {
  if (rooms.length === 0) {
    return <EmptyState compact title="No hay salas registradas." description="" />
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px] space-y-2">
        <div className="grid grid-cols-[1.9fr_1fr_0.8fr_0.8fr_0.9fr] gap-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span>Sala</span>
          <span>Tipo</span>
          <span className="text-right">Plantas</span>
          <span className="text-right">Zonas</span>
          <span className="text-right">Ocupacion</span>
        </div>
        <div className="space-y-2">
          {rooms.map((room) => (
            <RoomTableRow
              key={room.id}
              room={room}
              selected={room.id === selectedRoomId}
              onSelect={onSelectRoom}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoomTable
