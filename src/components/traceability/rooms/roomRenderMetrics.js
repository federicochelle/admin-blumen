function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getPositiveCount(value, fallback = 1) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const ZONE_PADDING_PX = 14
const ZONE_HEADER_HEIGHT_PX = 32
const ZONE_HEADER_TO_GRID_GAP_PX = 16
const MIN_ZONE_WIDTH_PX = 180
const BASE_ZONE_GAP_PX = 16
const MIN_ZONE_GAP_PX = 12
const MAX_ZONE_GAP_PX = 24
const MIN_CELL_GAP_PX = 5
const MAX_CELL_GAP_PX = 10
const MIN_CELL_SIZE_PX = 18
const MIN_PLANT_SIZE_PX = 10
const TARGET_HEIGHT_RATIO = 1

function ensureMinimum(value, minimum) {
  return Math.max(value, minimum)
}

function getBaseCellMetrics(maxDimension) {
  if (maxDimension <= 3) {
    return {
      cellSizePx: 40,
      cellGapPx: 10,
    }
  }

  if (maxDimension <= 5) {
    return {
      cellSizePx: 34,
      cellGapPx: 8,
    }
  }

  if (maxDimension <= 7) {
    return {
      cellSizePx: 28,
      cellGapPx: 7,
    }
  }

  if (maxDimension <= 10) {
    return {
      cellSizePx: 22,
      cellGapPx: 6,
    }
  }

  return {
    cellSizePx: 20,
    cellGapPx: 5,
  }
}

function getBaseZoneMetrics(bed) {
  const safeRowCount = getPositiveCount(bed?.rowCount ?? bed?.row_count, 1)
  const safeColumnCount = getPositiveCount(bed?.columnCount ?? bed?.column_count, 1)
  const maxDimension = Math.max(safeRowCount, safeColumnCount)
  const { cellSizePx, cellGapPx } = getBaseCellMetrics(maxDimension)
  const plantSizePx = ensureMinimum(Math.round(cellSizePx * 0.75), MIN_PLANT_SIZE_PX)
  const gridWidthPx =
    safeColumnCount * cellSizePx + Math.max(safeColumnCount - 1, 0) * cellGapPx
  const gridHeightPx =
    safeRowCount * cellSizePx + Math.max(safeRowCount - 1, 0) * cellGapPx

  return {
    bedId: bed.id,
    rowCount: safeRowCount,
    columnCount: safeColumnCount,
    cellSizePx,
    plantSizePx,
    cellGapPx,
    zoneWidthPx: Math.max(MIN_ZONE_WIDTH_PX, gridWidthPx + ZONE_PADDING_PX * 2),
    zoneHeightPx:
      gridHeightPx +
      ZONE_PADDING_PX * 2 +
      ZONE_HEADER_HEIGHT_PX +
      ZONE_HEADER_TO_GRID_GAP_PX,
  }
}

function buildRows(metricsList, availableWidthPx, zoneGapPx) {
  if (metricsList.length === 0) {
    return []
  }

  const rows = []
  let currentRow = []
  let currentWidth = 0

  metricsList.forEach((metrics) => {
    const nextWidth =
      currentRow.length === 0
        ? metrics.zoneWidthPx
        : currentWidth + zoneGapPx + metrics.zoneWidthPx

    if (currentRow.length > 0 && nextWidth > availableWidthPx) {
      rows.push(currentRow)
      currentRow = [metrics]
      currentWidth = metrics.zoneWidthPx
      return
    }

    currentRow.push(metrics)
    currentWidth = nextWidth
  })

  if (currentRow.length > 0) {
    rows.push(currentRow)
  }

  return rows
}

function scaleZoneMetrics(metrics, scaleFactor) {
  const cellSizePx = ensureMinimum(Math.round(metrics.cellSizePx * scaleFactor), MIN_CELL_SIZE_PX)
  const cellGapPx = clamp(Math.round(metrics.cellGapPx * scaleFactor), MIN_CELL_GAP_PX, MAX_CELL_GAP_PX)
  const plantSizePx = ensureMinimum(Math.round(cellSizePx * 0.75), MIN_PLANT_SIZE_PX)
  const gridWidthPx =
    metrics.columnCount * cellSizePx + Math.max(metrics.columnCount - 1, 0) * cellGapPx
  const gridHeightPx =
    metrics.rowCount * cellSizePx + Math.max(metrics.rowCount - 1, 0) * cellGapPx

  return {
    ...metrics,
    cellSizePx,
    cellGapPx,
    plantSizePx,
    zoneWidthPx: Math.max(MIN_ZONE_WIDTH_PX, gridWidthPx + ZONE_PADDING_PX * 2),
    zoneHeightPx:
      gridHeightPx +
      ZONE_PADDING_PX * 2 +
      ZONE_HEADER_HEIGHT_PX +
      ZONE_HEADER_TO_GRID_GAP_PX,
  }
}

export function getRoomRenderMetrics({ beds = [], availableWidthPx, availableHeightPx }) {
  const safeWidthPx = Math.max(Number(availableWidthPx) || 0, MIN_ZONE_WIDTH_PX)
  const safeHeightPx = Math.max(Number(availableHeightPx) || 0, 320)
  const baseMetricsList = beds.map((bed) => getBaseZoneMetrics(bed))
  const largestZoneMetrics = baseMetricsList.reduce((largest, metrics) => {
    if (!largest) {
      return metrics
    }

    const largestNaturalSize = Math.max(largest.zoneWidthPx, largest.zoneHeightPx)
    const nextNaturalSize = Math.max(metrics.zoneWidthPx, metrics.zoneHeightPx)

    return nextNaturalSize > largestNaturalSize ? metrics : largest
  }, null)
  const targetAvailableHeightPx = Math.max(safeHeightPx, 160)
  const targetZoneHeightPx = targetAvailableHeightPx * TARGET_HEIGHT_RATIO
  const referenceZoneHeightPx = largestZoneMetrics?.zoneHeightPx ?? 0
  const scaleFactor =
    referenceZoneHeightPx > 0 ? targetZoneHeightPx / referenceZoneHeightPx : 1
  const zoneGapPx = clamp(
    Math.round(BASE_ZONE_GAP_PX * Math.min(scaleFactor, 1.25)),
    MIN_ZONE_GAP_PX,
    MAX_ZONE_GAP_PX,
  )
  const scaledMetricsList = baseMetricsList.map((metrics) => scaleZoneMetrics(metrics, scaleFactor))
  const rows = buildRows(scaledMetricsList, safeWidthPx, zoneGapPx)

  return {
    zoneGapPx,
    roomHeightPx: safeHeightPx,
    roomWidthPx: safeWidthPx,
    rows,
    metricsByBedId: scaledMetricsList.reduce((accumulator, metrics) => {
      accumulator[metrics.bedId] = {
        ...metrics,
        zoneGapPx,
      }
      return accumulator
    }, {}),
  }
}
