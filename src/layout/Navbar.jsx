import { Bell, ChevronDown, LogOut, Menu, PanelLeft, Search, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuthContext } from '../contexts/AuthContext'

export function Navbar({ isSidebarCollapsed, title, onMenuClick }) {
  const { auth, sessionMessage, clearSessionMessage, logout, logoutState } = useAuthContext()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const userInitial = auth.user?.name?.charAt(0)?.toUpperCase() || auth.user?.email?.charAt(0)?.toUpperCase() || 'A'
  const userName = auth.user?.name ?? 'admin'
  const userEmail = auth.user?.email ?? ''
  const isLoggingOut = logoutState.status === 'loading'

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const handleLogout = () => {
    setProfileMenuOpen(false)
    void logout()
  }

  return (
    <header className="flex h-[74px] shrink-0 items-center justify-between gap-3 border-b border-[#2d282b] bg-[#171314] px-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2d282b] bg-[#211c1f] px-3 text-[#969baa] transition hover:border-[#3a3438] hover:text-white"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={20} className="md:hidden" />
          <PanelLeft size={18} className="hidden md:block" />
        </button>
        <h1 className="truncate text-xs font-bold text-white sm:text-sm">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        {sessionMessage ? (
          <button
            type="button"
            onClick={clearSessionMessage}
            className="hidden rounded-md border border-red-900/70 bg-red-950/30 px-3 py-2 text-xs font-semibold text-red-200 lg:inline-flex"
          >
            {sessionMessage}
          </button>
        ) : null}

        <label className="hidden h-10 w-[190px] items-center gap-2 rounded-xl border border-[#2d282b] bg-[#211c1f] px-3 text-sm text-[#969baa] lg:flex xl:w-[260px]">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search menus"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#969baa]"
          />
          <span className="rounded-md bg-[#171314] px-2 py-1 text-xs text-[#686b77]">Ctrl K</span>
        </label>

        <button className="hidden h-10 items-center gap-2 rounded-xl border border-[#2d282b] bg-[#211c1f] px-3 text-sm font-semibold text-white sm:inline-flex">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#100d0e] text-xs">US</span>
          English
          <ChevronDown size={15} className="text-[#969baa]" />
        </button>

        <button className="hidden rounded-lg p-2 text-[#969baa] hover:bg-[#211c1f] hover:text-white sm:inline-flex" aria-label="Theme">
          <Sun size={18} />
        </button>

        <button className="rounded-lg p-2 text-[#969baa] hover:bg-[#211c1f] hover:text-white" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setProfileMenuOpen((currentValue) => !currentValue)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#2d282b] bg-[#211c1f] px-2 pr-3 text-sm font-semibold text-white"
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-bold">
              {userInitial}
            </span>
            <span className="hidden md:inline">{userName}</span>
            <ChevronDown size={15} className={`text-[#969baa] transition ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-64 rounded-2xl border border-[#2d282b] bg-[#171314] p-2 shadow-[0_22px_60px_rgba(0,0,0,0.42)]">
              <div className="rounded-xl border border-[#2d282b] bg-[#100d0e] px-3 py-3">
                <p className="truncate text-sm font-semibold text-white">{userName}</p>
                <p className="mt-1 truncate text-xs text-[#8d95a7]">{userEmail}</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-2 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-200 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                <LogOut size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
