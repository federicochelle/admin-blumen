import UserMenu from './UserMenu'

function PageHeader({ children }) {
  return (
    <header className="-mx-4 mb-6 border-b border-slate-200 bg-white px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">{children}</div>
        <div className="shrink-0">
          <div className="hidden sm:block">
            <UserMenu />
          </div>
          <div className="sm:hidden">
            <UserMenu compact />
          </div>
        </div>
      </div>
    </header>
  )
}

export default PageHeader
