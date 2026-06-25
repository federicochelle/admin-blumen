import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../auth/useAuth'
import appLogo from '../../../logo.webp'

function UserMenu({ compact = false }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-brand-deep-purple/8">
          <img src={appLogo} alt="Blumen" className="h-7 w-7 object-contain" />
        </span>
        {!compact ? (
          <span className="max-w-[220px] truncate text-sm font-medium text-slate-900">
            {user?.email ?? 'Usuario'}
          </span>
        ) : null}
        <span className="text-xs text-slate-500">{open ? '▴' : '▾'}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+12px)] z-20 min-w-[13rem] rounded-[1.25rem] border border-slate-200 bg-white p-2 shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Configuracion
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cerrar sesion
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default UserMenu
