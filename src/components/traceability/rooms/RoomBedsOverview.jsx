import { useEffect, useRef, useState } from 'react'
import EmptyState from '../../shared/EmptyState'
import RoomLayoutCanvas from './RoomLayoutCanvas'
import { getRoomRenderMetrics } from './roomRenderMetrics'
import ZonePlantGrid from './ZonePlantGrid'

function BedCard({
  room,
  bed,
  selectedPlantId,
  onPlantClick,
  onEmptySlotClick,
  onEditBed,
  onDeleteBed,
  renderMetrics,
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
      className="group/bed relative flex-none rounded-[1.25rem] border border-slate-200/90 bg-white p-3.5 shadow-[0_10px_26px_rgba(15,23,42,0.05)] transition hover:border-slate-300 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
      style={{
        width: `${renderMetrics.zoneWidthPx}px`,
        height: `${renderMetrics.zoneHeightPx}px`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.14em] text-slate-950">
              {bed.code}
            </p>
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
        </div>
      </div>

      <div className="mt-4">
        <ZonePlantGrid
          zone={bed}
          selectedPlantId={selectedPlantId}
          renderMetrics={renderMetrics}
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

function RoomBedsOverview({
  room = null,
  beds,
  selectedPlantId,
  onPlantClick,
  onEmptySlotClick = null,
  eyebrow = null,
  title = null,
  showCount = true,
  onEditBed = null,
  onDeleteBed = null,
  onBedLayoutCommit = null,
  editable = false,
  embedded = false,
}) {
  const shouldUseLayoutCanvas = false
  const layoutContainerRef = useRef(null)
  const [layoutViewport, setLayoutViewport] = useState({
    width: 0,
    height: Math.round(window.innerHeight * 0.75),
  })

  useEffect(() => {
    if (!layoutContainerRef.current) {
      return undefined
    }

    const updateViewport = () => {
      const nextWidth = layoutContainerRef.current?.clientWidth ?? 0
      setLayoutViewport({
        width: nextWidth,
        height: Math.round(window.innerHeight * 0.75),
      })
    }

    updateViewport()

    const resizeObserver = new ResizeObserver(() => {
      updateViewport()
    })

    resizeObserver.observe(layoutContainerRef.current)
    window.addEventListener('resize', updateViewport)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  const roomRenderMetrics = getRoomRenderMetrics({
    beds,
    availableWidthPx: layoutViewport.width > 0 ? layoutViewport.width - 4 : 0,
    availableHeightPx: layoutViewport.height,
  })
  const bedMetricsById = roomRenderMetrics.metricsByBedId
  const zoneGapPx = roomRenderMetrics.zoneGapPx

  if (beds.length === 0) {
    return (
      <EmptyState
        compact
        title="Esta sala todavia no tiene zonas registradas."
        description=""
      />
    )
  }

  return (
    <section
      className={
        embedded
          ? 'space-y-4'
          : 'space-y-4 rounded-[1.5rem] border border-slate-200 bg-[#f7f5f1] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]'
      }
    >
      {eyebrow || title || showCount ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clay-700">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{title}</h4>
            ) : null}
          </div>
          {showCount ? (
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
              {beds.length} zonas
            </span>
          ) : null}
        </div>
      ) : null}

      {shouldUseLayoutCanvas ? (
        <RoomLayoutCanvas
          room={room}
          beds={beds}
          selectedPlantId={selectedPlantId}
          onPlantClick={onPlantClick}
          onEmptySlotClick={onEmptySlotClick}
          onEditBed={onEditBed}
          onDeleteBed={onDeleteBed}
          onBedLayoutCommit={onBedLayoutCommit}
          editable={editable}
        />
      ) : (
        <div ref={layoutContainerRef} className="min-h-[75vh] max-h-[75vh] overflow-y-auto pr-1">
          <div
            className="flex flex-wrap content-start items-start justify-evenly"
            style={{
              gap: `${zoneGapPx}px`,
            }}
          >
            {beds.map((bed) => (
              <BedCard
                key={bed.id}
                room={room}
                bed={bed}
                renderMetrics={bedMetricsById[bed.id]}
                selectedPlantId={selectedPlantId}
                onPlantClick={onPlantClick}
                onEmptySlotClick={onEmptySlotClick}
                onEditBed={onEditBed}
                onDeleteBed={onDeleteBed}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default RoomBedsOverview
