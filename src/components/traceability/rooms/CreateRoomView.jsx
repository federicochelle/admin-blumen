import { createRoomWithZones } from '../../../services/traceability.service'
import RoomFormView from './RoomFormView'

const DEFAULT_ROOM_LAYOUT_WIDTH = 24
const DEFAULT_ROOM_LAYOUT_HEIGHT = 16

function CreateRoomView({ onBack, onCreated }) {
  async function handleSubmit({ room, zones }) {
    const result = await createRoomWithZones(
      {
        name: room.name,
        type: room.type,
        status: room.status,
        description: room.description,
        layout_width: room.layout_width ?? DEFAULT_ROOM_LAYOUT_WIDTH,
        layout_height: room.layout_height ?? DEFAULT_ROOM_LAYOUT_HEIGHT,
      },
      zones.map((zone) => ({
        code: zone.code,
        capacity: zone.capacity,
        row_count: zone.row_count,
        column_count: zone.column_count,
        status: zone.status,
        description: zone.description,
        layout_x: zone.layout_x ?? null,
        layout_y: zone.layout_y ?? null,
        layout_width: zone.layout_width ?? null,
        layout_height: zone.layout_height ?? null,
      })),
    )

    await onCreated?.(result.room)
  }

  return (
    <RoomFormView
      mode="create"
      initialRoom={null}
      initialZones={[]}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  )
}

export default CreateRoomView
