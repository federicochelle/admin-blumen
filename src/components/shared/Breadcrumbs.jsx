function Breadcrumbs({ items = [] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-5 gap-y-2 text-2xl text-slate-400 sm:text-3xl">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-3">
              {item.onClick && !isLast ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="font-medium tracking-tight transition hover:text-slate-700"
                >
                  {item.label}
                </button>
              ) : (
                <span className={isLast ? 'font-semibold tracking-tight text-slate-950' : 'font-medium tracking-tight'}>
                  {item.label}
                </span>
              )}

              {!isLast ? <span className="text-slate-300">&gt;</span> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
