import { useEffect, useMemo, useState } from 'react'
import CreateRoomView from '../rooms/CreateRoomView'
import EditRoomView from '../rooms/EditRoomView'
import RoomDetailView from '../rooms/RoomDetailView'
import RoomsListView from '../rooms/RoomsListView'

function normalizeType(type) {
  return String(type ?? 'Sin tipo').toLowerCase()
}

function countRoomsByKeyword(rooms, keyword) {
  return rooms.filter((room) => normalizeType(room.type).includes(keyword)).length
}

function TraceabilityRoomsView({
  rooms,
  selectedRoom,
  selectedRoomId,
  roomBeds,
  plants,
  onSelectRoom,
  onRefreshRooms,
  onOpenPlantDetail,
  viewMode = 'list',
  onNavigateList,
  onNavigateDetail,
  onNavigateEdit,
  onNavigateCreate,
  loading,
}) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = useMemo(() => {
    const baseFilters = [
      { value: 'all', label: 'Todas las salas', count: rooms.length },
      { value: 'vegetacion', label: 'Vegetacion', count: countRoomsByKeyword(rooms, 'veget') },
      { value: 'floracion', label: 'Floracion', count: countRoomsByKeyword(rooms, 'flor') },
      { value: 'secado', label: 'Secado', count: countRoomsByKeyword(rooms, 'sec') },
    ]

    const dynamicTypes = Array.from(new Set(rooms.map((room) => room.type).filter(Boolean)))
      .filter((type) => {
        const normalized = normalizeType(type)
        return !['vegetacion', 'floracion', 'secado'].some((preset) => normalized.includes(preset.slice(0, 4)))
      })
      .map((type) => ({
        value: `type:${type}`,
        label: type,
        count: rooms.filter((room) => room.type === type).length,
      }))

    return [...baseFilters, ...dynamicTypes].filter(
      (filter) => filter.value === 'all' || filter.count > 0,
    )
  }, [rooms])

  const filteredRooms = useMemo(() => {
    if (activeFilter === 'all') {
      return rooms
    }

    if (activeFilter === 'vegetacion') {
      return rooms.filter((room) => normalizeType(room.type).includes('veget'))
    }

    if (activeFilter === 'floracion') {
      return rooms.filter((room) => normalizeType(room.type).includes('flor'))
    }

    if (activeFilter === 'secado') {
      return rooms.filter((room) => normalizeType(room.type).includes('sec'))
    }

    if (activeFilter.startsWith('type:')) {
      return rooms.filter((room) => room.type === activeFilter.replace('type:', ''))
    }

    return rooms
  }, [activeFilter, rooms])

  useEffect(() => {
    if (filteredRooms.length === 0 || selectedRoomId === null) {
      return
    }

    if (!filteredRooms.some((room) => room.id === selectedRoomId)) {
      onSelectRoom(filteredRooms[0].id)
    }
  }, [filteredRooms, onSelectRoom, selectedRoomId])

  const filteredSelectedRoom =
    filteredRooms.find((room) => room.id === selectedRoomId) ?? selectedRoom ?? null

  const handleOpenRoom = (roomId) => {
    onSelectRoom(roomId)
    onNavigateDetail?.(roomId)
  }

  const handleBackToList = () => {
    onNavigateList?.()
  }

  const handleOpenCreate = () => {
    onNavigateCreate?.()
  }

  const handleRoomDeleted = async () => {
    await onRefreshRooms?.()
    onNavigateList?.()
  }

  const handleRoomCreated = async (room) => {
    await onRefreshRooms?.(room.id)
    onSelectRoom(room.id)
    onNavigateList?.()
  }

  const handleRoomUpdated = async (roomId) => {
    await onRefreshRooms?.(roomId)
    onSelectRoom(roomId)
    onNavigateDetail?.(roomId)
  }

  return (
    <section className="space-y-5">
      {loading ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          Cargando salas y zonas...
        </div>
      ) : viewMode === 'detail' && filteredSelectedRoom ? (
        <RoomDetailView
          room={filteredSelectedRoom}
          beds={roomBeds}
          plants={plants}
          onBack={handleBackToList}
          onDataChanged={onRefreshRooms}
          onOpenPlantDetail={onOpenPlantDetail}
          onEditRoom={onNavigateEdit}
          onRoomDeleted={handleRoomDeleted}
        />
      ) : viewMode === 'edit' && filteredSelectedRoom ? (
        <EditRoomView
          roomId={filteredSelectedRoom.id}
          onBack={handleBackToList}
          onUpdated={handleRoomUpdated}
        />
      ) : viewMode === 'create' ? (
        <CreateRoomView onBack={handleBackToList} onCreated={handleRoomCreated} />
      ) : (
        <RoomsListView
          rooms={rooms}
          activeFilter={activeFilter}
          filters={filters}
          filteredRooms={filteredRooms}
          selectedRoomId={viewMode === 'list' ? null : filteredSelectedRoom?.id ?? null}
          onChangeFilter={setActiveFilter}
          onSelectRoom={handleOpenRoom}
          onCreateRoom={handleOpenCreate}
        />
      )}
    </section>
  )
}

export default TraceabilityRoomsView
