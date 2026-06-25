import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCanvasDimensions,
  getEffectiveCanvasDimensions,
  getRenderedBedLayout,
} from './roomLayout.utils'
import ZonePlantGrid from './ZonePlantGrid'

function roundLayoutValue(value) {
  return Math.round(value * 100) / 100
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizePersistedCoordinate(value, max) {
  return clamp(Math.round(Number(value) || 0), 0, Math.max(Math.floor(max), 0))
}

function toCanvasPixels(value, canvasPixels, canvasUnits) {
  if (canvasPixels <= 0 || canvasUnits <= 0) {
    return 0
  }

  return (value / canvasUnits) * canvasPixels
}

function buildPositionsMap(beds) {
  return beds.reduce((accumulator, bed) => {
    accumulator[bed.id] = getRenderedBedLayout(bed)
    return accumulator
  }, {})
}

function LayoutZoneCard({
  room,
  bed,
  selectedPlantId,
  onPlantClick,
  onEmptySlotClick,
  onEditBed,
  onDeleteBed,
  draggable = false,
  selected = false,
  dragging = false,
  onDragHandlePointerDown,
  onSelect,
}) {
  const showActions = Boolean(onEditBed || onDeleteBed)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [menuOpen])

  return (
    <article
      onClick={onSelect}
      style={{ touchAction: 'none' }}
      className={`group/bed inline-flex flex-col rounded-[1.15rem] border bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition ${
        selected
          ? 'border-brand-turquoise shadow-[0_18px_36px_rgba(45,212,191,0.18)]'
          : 'border-slate-200/90 hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]'
      } ${dragging ? 'scale-[1.01] opacity-95 shadow-[0_24px_44px_rgba(15,23,42,0.18)]' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div
          onPointerDown={onDragHandlePointerDown}
          className={`min-w-0 flex-1 rounded-xl px-1.5 py-1 ${
            draggable ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <circle cx="6" cy="5" r="1.1" />
                <circle cx="10" cy="5" r="1.1" />
                <circle cx="14" cy="5" r="1.1" />
                <circle cx="6" cy="10" r="1.1" />
                <circle cx="10" cy="10" r="1.1" />
                <circle cx="14" cy="10" r="1.1" />
                <circle cx="6" cy="15" r="1.1" />
                <circle cx="10" cy="15" r="1.1" />
                <circle cx="14" cy="15" r="1.1" />
              </svg>
            </span>

            <p className="truncate text-sm font-semibold uppercase tracking-[0.14em] text-slate-950">
              {bed.code}
            </p>
          </div>
        </div>

        {showActions ? (
          <div
            ref={menuRef}
            className="relative z-20 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-200 [@media(hover:hover)]:group-hover/bed:pointer-events-auto [@media(hover:hover)]:group-hover/bed:opacity-100"
          >
            <button
              type="button"
              onClick={() => setMenuOpen((current) => !current)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition hover:border-slate-300 hover:text-slate-700"
              aria-label={`Acciones para ${bed.code}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <circle cx="6.5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="17.5" cy="12" r="1.5" />
              </svg>
            </button>

            {menuOpen ? (
              <div className="absolute left-0 top-[calc(100%+0.45rem)] min-w-[10.5rem] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                {onEditBed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEditBed(bed)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
                      <path d="M13.5 6.5l4 4" />
                    </svg>
                    Editar zona
                  </button>
                ) : null}

                {onDeleteBed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDeleteBed(bed)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-700 transition hover:bg-rose-50 hover:text-rose-800"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M5 7h14" />
                      <path d="M9 7V5h6v2" />
                      <path d="M8 7l1 12h6l1-12" />
                      <path d="M10 11v5" />
                      <path d="M14 11v5" />
                    </svg>
                    Eliminar zona
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3">
        <ZonePlantGrid
          zone={bed}
          selectedPlantId={selectedPlantId}
          onPlantClick={onPlantClick}
          onEmptySlotClick={
            onEmptySlotClick && bed.allowEmptySlotCreate !== false
              ? (slot) =>
                  onEmptySlotClick({
                    ...slot,
                    room,
                    bed,
                  })
              : undefined
          }
        />
      </div>
    </article>
  )
}

function RoomLayoutCanvas({
  room = null,
  beds,
  selectedPlantId,
  onPlantClick,
  onEmptySlotClick = null,
  onEditBed = null,
  onDeleteBed = null,
  onBedLayoutCommit = null,
  editable = false,
}) {
  const canvasRef = useRef(null)
  const dragStateRef = useRef(null)
  const positionsRef = useRef({})
  const baseCanvas = useMemo(() => getCanvasDimensions(room, beds), [beds, room])
  const effectiveCanvas = useMemo(() => getEffectiveCanvasDimensions(room, beds), [beds, room])
  const basePositions = useMemo(() => buildPositionsMap(beds), [beds])
  const [positions, setPositions] = useState({})
  const [selectedBedId, setSelectedBedId] = useState(null)
  const [draggingBedId, setDraggingBedId] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined
    }

    const updateCanvasSize = () => {
      if (!canvasRef.current) {
        return
      }

      const rect = canvasRef.current.getBoundingClientRect()
      setCanvasSize({
        width: rect.width,
        height: rect.height,
      })
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
    })

    resizeObserver.observe(canvasRef.current)
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [effectiveCanvas.height, effectiveCanvas.width])

  useEffect(() => {
    function releaseCapturedPointer(dragState) {
      if (
        dragState?.pointerElement &&
        dragState.pointerId !== null &&
        dragState.pointerElement.hasPointerCapture?.(dragState.pointerId)
      ) {
        dragState.pointerElement.releasePointerCapture(dragState.pointerId)
      }
    }

    function finishDrag() {
      const dragState = dragStateRef.current

      if (!editable || !dragState) {
        return
      }

      dragStateRef.current = null
      releaseCapturedPointer(dragState)
      setDraggingBedId(null)

      const nextPosition =
        positionsRef.current[dragState.bedId] ?? basePositions[dragState.bedId]
      if (!nextPosition) {
        return
      }

      const persistedX = normalizePersistedCoordinate(
        nextPosition.x,
        effectiveCanvas.width - dragState.width,
      )
      const persistedY = normalizePersistedCoordinate(
        nextPosition.y,
        effectiveCanvas.height - dragState.height,
      )
      const changed =
        persistedX !== dragState.originX || persistedY !== dragState.originY

      if (!changed || !onBedLayoutCommit) {
        return
      }

      setPositions((current) => ({
        ...current,
        [dragState.bedId]: {
          ...(current[dragState.bedId] ?? basePositions[dragState.bedId]),
          x: persistedX,
          y: persistedY,
        },
      }))
      onBedLayoutCommit(beds.find((bed) => bed.id === dragState.bedId), {
        layout_x: persistedX,
        layout_y: persistedY,
      })
    }

    function handlePointerMove(event) {
      const dragState = dragStateRef.current

      if (!editable || !dragState || !canvasRef.current) {
        return
      }

      if (event.pointerId !== dragState.pointerId) {
        return
      }

      const rect = canvasRef.current.getBoundingClientRect()
      const deltaX = ((event.clientX - dragState.startClientX) / rect.width) * effectiveCanvas.width
      const deltaY = ((event.clientY - dragState.startClientY) / rect.height) * effectiveCanvas.height
      const maxX = Math.max(effectiveCanvas.width - dragState.width, 0)
      const maxY = Math.max(effectiveCanvas.height - dragState.height, 0)
      const nextX = roundLayoutValue(clamp(dragState.originX + deltaX, 0, maxX))
      const nextY = roundLayoutValue(clamp(dragState.originY + deltaY, 0, maxY))

      setPositions((current) => ({
        ...current,
        [dragState.bedId]: {
          ...current[dragState.bedId],
          x: nextX,
          y: nextY,
        },
      }))
    }

    function handlePointerUp(event) {
      const dragState = dragStateRef.current

      if (!dragState) {
        return
      }

      if (event.pointerId !== dragState.pointerId) {
        return
      }

      finishDrag()
    }

    function handlePointerCancel(event) {
      const dragState = dragStateRef.current

      if (!dragState) {
        return
      }

      if (event.pointerId !== dragState.pointerId) {
        return
      }

      finishDrag()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)

    return () => {
      releaseCapturedPointer(dragStateRef.current)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
    }
  }, [basePositions, beds, editable, effectiveCanvas.height, effectiveCanvas.width, onBedLayoutCommit])

  const activeSelectedBedId = beds.some((bed) => bed.id === selectedBedId) ? selectedBedId : null

  function handleZonePointerDown(event, bed) {
    if (!editable || !onBedLayoutCommit) {
      return
    }

    if (event.button !== 0) {
      return
    }

    const position = positions[bed.id] ?? basePositions[bed.id]
    if (!position) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setSelectedBedId(bed.id)
    setDraggingBedId(bed.id)
    dragStateRef.current = {
      bedId: bed.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: position.x,
      originY: position.y,
      width: position.width,
      height: position.height,
      pointerId: event.pointerId,
      pointerElement: event.currentTarget,
    }
  }

  return (
    <div className="overflow-x-auto overflow-y-visible rounded-[1.5rem] border border-slate-200/90 bg-[#fbfaf7] p-4">
      <div
        ref={canvasRef}
        className="relative rounded-[1.25rem] border border-dashed border-slate-300/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))]"
        style={{
          width:
            baseCanvas.width > 0
              ? `${Math.max(effectiveCanvas.width / baseCanvas.width, 1) * 100}%`
              : '100%',
          minWidth: '100%',
          aspectRatio: `${effectiveCanvas.width} / ${effectiveCanvas.height}`,
          minHeight: `${effectiveCanvas.height}rem`,
        }}
      >
        {beds.map((bed) => {
          const position = positions[bed.id] ?? basePositions[bed.id] ?? {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          }
          const wrapperLeftPx = toCanvasPixels(position.x, canvasSize.width, effectiveCanvas.width)
          const wrapperTopPx = toCanvasPixels(position.y, canvasSize.height, effectiveCanvas.height)
          const wrapperWidthPx = toCanvasPixels(position.width, canvasSize.width, effectiveCanvas.width)
          const wrapperHeightPx = toCanvasPixels(position.height, canvasSize.height, effectiveCanvas.height)

          return (
            <div
              key={bed.id}
              className="absolute p-2"
              style={{
                left: canvasSize.width > 0 ? `${wrapperLeftPx}px` : `${(position.x / effectiveCanvas.width) * 100}%`,
                top: canvasSize.height > 0 ? `${wrapperTopPx}px` : `${(position.y / effectiveCanvas.height) * 100}%`,
                width: canvasSize.width > 0 ? `${wrapperWidthPx}px` : `${(position.width / effectiveCanvas.width) * 100}%`,
                height: canvasSize.height > 0 ? `${wrapperHeightPx}px` : `${(position.height / effectiveCanvas.height) * 100}%`,
                zIndex: draggingBedId === bed.id ? 20 : activeSelectedBedId === bed.id ? 10 : 1,
                pointerEvents: 'auto',
              }}
            >
              <LayoutZoneCard
                room={room}
                bed={bed}
                selectedPlantId={selectedPlantId}
                onPlantClick={onPlantClick}
                onEmptySlotClick={onEmptySlotClick}
                onEditBed={onEditBed}
                onDeleteBed={onDeleteBed}
                draggable={editable && Boolean(onBedLayoutCommit)}
                selected={activeSelectedBedId === bed.id}
                dragging={draggingBedId === bed.id}
                onSelect={() => setSelectedBedId(bed.id)}
                onDragHandlePointerDown={(event) => handleZonePointerDown(event, bed)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoomLayoutCanvas
