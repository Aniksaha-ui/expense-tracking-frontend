import { ChevronRight, GalleryVerticalEnd, LogOut, RefreshCcw, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { getSupportedRoute, hasChildren } from '../features/menu/utils/menuHelpers'
import { MenuIcon } from '../features/menu/utils/menuIcons'

function MenuSection({ isCollapsed, items, onClose, onExpandRequest }) {
  const [expandedItems, setExpandedItems] = useState({})

  const toggleExpanded = (itemId) => {
    setExpandedItems((currentItems) => ({
      ...currentItems,
      [itemId]: !currentItems[itemId],
    }))
  }

  const renderItems = (menuItems, level = 0) =>
    menuItems.map((item) => {
      const supportedRoute = getSupportedRoute(item.path)
      const expanded = Boolean(expandedItems[item.id])
      const childItems = hasChildren(item) ? renderItems(item.children, level + 1) : null

      if (supportedRoute) {
        return (
          <div key={item.id}>
            <NavLink
              to={supportedRoute}
              onClick={onClose}
              title={item.title}
              className={({ isActive }) =>
                `flex h-10 items-center rounded-lg text-sm font-medium transition ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                } ${
                  isActive ? 'bg-[#17214a] text-[#7ea1ff]' : 'text-[#969baa] hover:bg-[#211c1f] hover:text-white'
                }`
              }
              style={isCollapsed ? undefined : { paddingLeft: `${12 + level * 18}px` }}
            >
              <MenuIcon name={item.icon} size={17} />
              {isCollapsed ? null : <span className="truncate">{item.title}</span>}
            </NavLink>
            {isCollapsed ? null : childItems}
          </div>
        )
      }

      return (
        <div key={item.id}>
          <button
            type="button"
            onClick={() => {
              if (!hasChildren(item)) {
                return
              }

              if (isCollapsed) {
                onExpandRequest?.()
                return
              }

              toggleExpanded(item.id)
            }}
            className={`flex h-10 w-full items-center rounded-lg text-left text-sm font-medium text-[#969baa] transition hover:bg-[#211c1f] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            }`}
            style={isCollapsed ? undefined : { paddingLeft: `${12 + level * 18}px` }}
            disabled={!hasChildren(item)}
            title={
              hasChildren(item)
                ? isCollapsed
                  ? `Expand sidebar to open ${item.title}`
                  : item.title
                : 'Page is not available in this revamp yet'
            }
          >
            <MenuIcon name={item.icon} size={17} />
            {isCollapsed ? null : <span className="min-w-0 flex-1 truncate">{item.title}</span>}
            {!isCollapsed && hasChildren(item) ? (
              <ChevronRight size={15} className={`transition ${expanded ? 'rotate-90' : ''}`} />
            ) : null}
          </button>
          {!isCollapsed && expanded ? childItems : null}
        </div>
      )
    })

  return <>{renderItems(items)}</>
}

export function Sidebar({ isCollapsed, isOpen, onClose, onExpand }) {
  const { auth, loadMenu, logout, logoutState, menu } = useAuthContext()
  const userInitial = auth.user?.name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'A'
  const userName = auth.user?.name ?? 'admin'
  const userEmail = auth.user?.email ?? ''
  const hasMenu = menu.mainMenuItems.length > 0 || menu.bottomMenuItems.length > 0
  const isLoggingOut = logoutState.status === 'loading'

  return (
    <>
      {isOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] max-w-[86vw] flex-col border-r border-[#2d282b] bg-[#171314] text-[#969baa] transition-[width,transform] duration-200 md:static md:w-[256px] md:max-w-none md:translate-x-0 ${
          isCollapsed ? 'md:w-[88px]' : 'md:w-[256px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className={`flex h-[74px] items-center border-b border-[#2d282b] ${
              isCollapsed ? 'justify-center px-3 md:px-0' : 'gap-3 px-4'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-600">
              <GalleryVerticalEnd size={22} />
            </div>
            {isCollapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-none text-white">VeltraxCRM</p>
                <p className="mt-1 truncate text-xs text-[#686b77]">Manage everything in one place</p>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-lg p-2 text-[#969baa] transition hover:bg-[#211c1f] hover:text-white md:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-5">
            {menu.status === 'loading' && !hasMenu && !isCollapsed ? (
              <div className="rounded-lg border border-[#2d282b] px-3 py-4 text-sm font-medium text-[#969baa]">
                Loading menu items...
              </div>
            ) : null}

            {menu.status === 'failed' && !hasMenu && !isCollapsed ? (
              <div className="space-y-3 rounded-lg border border-red-900/60 bg-red-950/20 px-3 py-4 text-sm text-red-200">
                <p>{menu.error || 'Unable to load menu items.'}</p>
                <button
                  type="button"
                  onClick={() => loadMenu({ force: true }).catch(() => {})}
                  className="inline-flex items-center gap-2 text-xs font-bold text-red-100 hover:text-white"
                >
                  <RefreshCcw size={14} />
                  Retry
                </button>
              </div>
            ) : null}

            {hasMenu ? (
              <>
                <MenuSection
                  isCollapsed={isCollapsed}
                  items={menu.mainMenuItems}
                  onClose={onClose}
                  onExpandRequest={onExpand}
                />
                {menu.bottomMenuItems.length && !isCollapsed ? (
                  <div className="pt-4">
                    <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#686b77]">
                      More tools
                    </p>
                    <MenuSection
                      isCollapsed={isCollapsed}
                      items={menu.bottomMenuItems}
                      onClose={onClose}
                      onExpandRequest={onExpand}
                    />
                  </div>
                ) : null}
                {menu.bottomMenuItems.length && isCollapsed ? (
                  <div className="border-t border-[#2d282b] pt-4">
                    <MenuSection
                      isCollapsed={isCollapsed}
                      items={menu.bottomMenuItems}
                      onClose={onClose}
                      onExpandRequest={onExpand}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </nav>
        </div>

        <div className={`border-t border-[#2d282b] p-4 ${isCollapsed ? 'flex flex-col items-center gap-3' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'mb-0 flex-col text-center' : 'mb-3'}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
              {userInitial}
            </div>
            {isCollapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{userName}</p>
                <p className="truncate text-xs text-[#686b77]">{userEmail}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            disabled={isLoggingOut}
            title={isCollapsed ? 'Sign out' : undefined}
            className={`flex h-9 items-center justify-center gap-2 rounded-lg border border-red-800/70 text-xs font-semibold text-red-300 transition hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-60 ${
              isCollapsed ? 'w-9' : 'w-full'
            }`}
          >
            <LogOut size={15} />
            {isCollapsed ? null : isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  )
}
