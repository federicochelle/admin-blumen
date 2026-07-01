import appLogo from '../../logo.webp'
import SidebarSection from './SidebarSection'

const sidebarGroups = [
  {
    title: 'Mi Club',
    items: [
      { label: 'Socios', active: false, icon: 'users' },
      { label: 'Cuotas / Caja', active: false, icon: 'wallet' },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { label: 'Entregas', active: false, icon: 'truck' },
      { label: 'Stock', active: false, icon: 'boxes' },
      { label: 'Salas', path: '/salas', icon: 'leaf' },
      { label: 'Plantas', path: '/plantas', icon: 'sprout' },
      { label: 'Lotes', path: '/lotes', icon: 'layers' },
    ],
  },
  {
    title: 'Control',
    items: [
      { label: 'Reportes', active: false, icon: 'chart' },
      { label: 'Auditoria', active: false, icon: 'shield' },
      { label: 'Usuarios y roles', active: false, icon: 'lock' },
    ],
  },
]

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[290px] shrink-0 border-r border-white/20 bg-brand-deep-purple text-white lg:flex">
      <div className="flex w-full flex-col px-0 py-0">
        <div className="flex items-center">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden p-1">
            <img src={appLogo} alt="Blumen" className="h-full w-full object-contain" />
          </div>
          <h1 className="-ml-2 text-2xl font-bold tracking-[0.08em] text-white">BLUMEN</h1>
        </div>

        <div className="mt-2 flex flex-1 flex-col gap-7 px-3 pb-3">
          {sidebarGroups.map((group) => (
            <SidebarSection key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
