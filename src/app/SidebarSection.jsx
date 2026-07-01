import { NavLink } from 'react-router-dom'

function SidebarIcon({ icon, muted = false }) {
  const className = `h-4.5 w-4.5 ${muted ? 'opacity-65' : ''}`

  switch (icon) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 13h7V4H4z" />
          <path d="M13 20h7v-9h-7z" />
          <path d="M13 11h7V4h-7z" />
          <path d="M4 20h7v-5H4z" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <path d="M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5z" />
          <path d="M3 8h13" />
          <path d="M16.5 14h.01" />
        </svg>
      )
    case 'truck':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 17H6V8h10v9h-2" />
          <path d="M16 11h3l2 2v4h-2" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="18" cy="17" r="2" />
        </svg>
      )
    case 'boxes':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m3 7 5-3 5 3-5 3Z" />
          <path d="m13 7 5-3 5 3-5 3Z" />
          <path d="m8 10 5 3v6l-5-3Z" />
          <path d="m18 10 5 3v6l-5-3Z" />
          <path d="M3 7v6l5 3v-6Z" />
          <path d="M13 7v6l5 3v-6Z" />
        </svg>
      )
    case 'leaf':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 21c5 0 12-3 12-12V4h-5C6 4 3 11 3 16c0 3 1 5 3 5Z" />
          <path d="M8 16c2-2 5-4 9-5" />
        </svg>
      )
    case 'sprout':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21v-8" />
          <path d="M12 13c0-3 2-5 5-6 0 3-1 6-5 6Z" />
          <path d="M12 16c0-2-1.5-4-4.5-5 0 3 1.5 5 4.5 5Z" />
        </svg>
      )
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      )
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20v-4" />
        </svg>
      )
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6z" />
          <path d="m9.5 12 1.7 1.7 3.8-4.2" />
        </svg>
      )
    case 'lock':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

function SidebarSection({ items }) {
  return (
    <section className="space-y-3">
      <div
        aria-hidden="true"
        className="mx-3 h-px bg-gradient-to-r from-white/0 via-white/14 to-white/0"
      />
      <div className="space-y-1.5">
        {items.map((item) => {
          if (item.path) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,0.16)]'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-current/10">
                    <SidebarIcon icon={item.icon} />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </span>
              </NavLink>
            )
          }

          const isActive = item.active

          return (
            <button
              key={item.label}
              type="button"
              disabled={!isActive}
              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                isActive
                  ? 'bg-white text-slate-950 shadow-[0_12px_30px_rgba(255,255,255,0.16)]'
                  : 'cursor-not-allowed text-white/38 opacity-75'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <SidebarIcon icon={item.icon} muted />
                </span>
                <span className="font-medium">{item.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default SidebarSection
