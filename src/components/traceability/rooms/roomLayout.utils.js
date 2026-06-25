function getLayoutValue(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getPositiveCount(value, fallback = 1) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const ZONE_CARD_HORIZONTAL_PADDING_REM = 1.5
const ZONE_CARD_VERTICAL_PADDING_REM = 1.5
const ZONE_HEADER_HEIGHT_REM = 1.25
const ZONE_HEADER_TO_GRID_REM = 0.75
const ZONE_GRID_GAP_REM = 0.625

function getMinimumSlotSizeRem(columnCount) {
  if (columnCount <= 2) {
    return 3.3
  }

  if (columnCount <= 4) {
    return 2.8
  }

  return 2.35
}

export function hasValidBedLayout(bed) {
  const x = getLayoutValue(bed?.layout_x ?? bed?.layout?.x)
  const y = getLayoutValue(bed?.layout_y ?? bed?.layout?.y)
  const width = getLayoutValue(bed?.layout_width ?? bed?.layout?.width)
  const height = getLayoutValue(bed?.layout_height ?? bed?.layout?.height)

  return (
    x !== null &&
    y !== null &&
    width !== null &&
    height !== null &&
    x >= 0 &&
    y >= 0 &&
    width > 0 &&
    height > 0
  )
}

export function getRoomLayoutDimensions(room) {
  const roomWidth = getLayoutValue(room?.layout_width ?? room?.layout?.width)
  const roomHeight = getLayoutValue(room?.layout_height ?? room?.layout?.height)

  if (roomWidth && roomHeight && roomWidth > 0 && roomHeight > 0) {
    return {
      width: roomWidth,
      height: roomHeight,
    }
  }

  return null
}

export function getCanvasDimensions(room, beds) {
  const roomDimensions = getRoomLayoutDimensions(room)

  if (roomDimensions) {
    return roomDimensions
  }

  const bounds = beds.reduce(
    (accumulator, bed) => {
      const renderedLayout = getRenderedBedLayout(bed)

      return {
        width: Math.max(accumulator.width, renderedLayout.x + renderedLayout.width),
        height: Math.max(accumulator.height, renderedLayout.y + renderedLayout.height),
      }
    },
    { width: 0, height: 0 },
  )

  return {
    width: bounds.width || 1,
    height: bounds.height || 1,
  }
}

export function getEffectiveCanvasDimensions(room, beds) {
  const baseDimensions = getCanvasDimensions(room, beds)

  const bounds = beds.reduce(
    (accumulator, bed) => {
      const renderedLayout = getRenderedBedLayout(bed)

      return {
        width: Math.max(accumulator.width, renderedLayout.x + renderedLayout.width),
        height: Math.max(accumulator.height, renderedLayout.y + renderedLayout.height),
      }
    },
    {
      width: baseDimensions.width,
      height: baseDimensions.height,
    },
  )

  return {
    width: Math.max(baseDimensions.width, bounds.width || 1),
    height: Math.max(baseDimensions.height, bounds.height || 1),
  }
}

export function getMinimumBedLayoutSize(bed) {
  const rowCount = getPositiveCount(bed?.rowCount ?? bed?.row_count, 1)
  const columnCount = getPositiveCount(bed?.columnCount ?? bed?.column_count, 1)
  const slotSizeRem = getMinimumSlotSizeRem(columnCount)
  const gridWidthRem =
    columnCount * slotSizeRem + Math.max(columnCount - 1, 0) * ZONE_GRID_GAP_REM
  const gridHeightRem =
    rowCount * slotSizeRem + Math.max(rowCount - 1, 0) * ZONE_GRID_GAP_REM

  return {
    width: ZONE_CARD_HORIZONTAL_PADDING_REM + gridWidthRem,
    height:
      ZONE_CARD_VERTICAL_PADDING_REM +
      ZONE_HEADER_HEIGHT_REM +
      ZONE_HEADER_TO_GRID_REM +
      gridHeightRem,
  }
}

export function getRenderedBedLayout(bed) {
  const x = getLayoutValue(bed?.layout_x ?? bed?.layout?.x) ?? 0
  const y = getLayoutValue(bed?.layout_y ?? bed?.layout?.y) ?? 0
  const persistedWidth = getLayoutValue(bed?.layout_width ?? bed?.layout?.width) ?? 1
  const persistedHeight = getLayoutValue(bed?.layout_height ?? bed?.layout?.height) ?? 1
  const minimumSize = getMinimumBedLayoutSize(bed)

  return {
    x,
    y,
    width: Math.max(persistedWidth, minimumSize.width),
    height: Math.max(persistedHeight, minimumSize.height),
  }
}
