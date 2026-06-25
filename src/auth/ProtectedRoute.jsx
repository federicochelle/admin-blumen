import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

function FullScreenState({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f0ea] px-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
        {message}
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <FullScreenState message="Cargando sesion..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <FullScreenState message="Cargando sesion..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/salas" replace />
  }

  return <Outlet />
}
