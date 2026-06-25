import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function AppShell() {
  return (
    <div className="min-h-screen bg-[#f3f0ea] text-slate-950 lg:flex">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 px-4 pb-4 pt-0 sm:px-6 sm:pb-6 sm:pt-0 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
