import { Menu, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/common/Toaster'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { APP_ROUTES } from '../../../constants/routes'
import { useAuthContext } from '../../../contexts/AuthContext'
import { MenuItemsOverview } from '../component/MenuItemsOverview.jsx'
import { menuItemsColumns } from '../component/column.jsx'
import { MENU_ITEMS_PAGE_COPY } from '../constants/menuItems.constants'
import useMenuItems from '../hooks/useMenuItems'
import { deleteMenuItem } from '../service/menuItemsService'
import { buildMenuItemMetrics, filterMenuItemsByRole } from '../utils/menuItemsUtils'

const tabs = [
  { key: 'admin', label: 'Admin Menu' },
  { key: 'guide', label: 'Guide Menu' },
]

export default function MenuItemsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { loadMenu } = useAuthContext()
  const apiState = useMenuItems()
  const [activeTab, setActiveTab] = useState('admin')
  const [activeDeleteId, setActiveDeleteId] = useState(null)
  const visibleItems = useMemo(
    () => filterMenuItemsByRole(apiState.items, activeTab),
    [activeTab, apiState.items],
  )
  const metrics = useMemo(() => buildMenuItemMetrics(apiState.items, apiState.pagination), [apiState.items, apiState.pagination])

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No menu items found.'
    }

    const rangeLabel =
      apiState.pagination.from && apiState.pagination.to
        ? `${apiState.pagination.from}-${apiState.pagination.to}`
        : `${visibleItems.length}`

    const tabLabel = tabs.find((tab) => tab.key === activeTab)?.label.toLowerCase() ?? 'menu items'

    return `Showing ${visibleItems.length} ${tabLabel} on this page • ${rangeLabel} of ${apiState.pagination.total || apiState.items.length} matched records`
  }, [activeTab, apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total, visibleItems.length])

  const handleDelete = async (item) => {
    const shouldDelete = window.confirm(`Delete "${item.title}"? This action cannot be undone.`)

    if (!shouldDelete) {
      return
    }

    try {
      setActiveDeleteId(item.id)
      await deleteMenuItem(item.id)
      toast.success('Menu item deleted successfully.')
      await loadMenu({ force: true }).catch(() => {})

      const isLastItemOnPage = apiState.items.length === 1 && apiState.page > 1
      const nextPage = isLastItemOnPage ? apiState.page - 1 : apiState.page

      if (nextPage !== apiState.page) {
        apiState.setPage(nextPage)
      } else {
        await apiState.refresh()
      }
    } catch (error) {
      toast.error(error.message || 'Unable to delete menu item.')
    } finally {
      setActiveDeleteId(null)
    }
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="routes-page__title">
                <Menu size={20} color="#4f83ff" />
                <h1>{MENU_ITEMS_PAGE_COPY.title}</h1>
              </div>
              <p className="routes-page__subtitle">{MENU_ITEMS_PAGE_COPY.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#332d30] bg-[#171314] px-4 text-sm font-semibold text-[#c5d9f7]">
                <Menu size={16} />
                <span>{apiState.pagination.total || apiState.items.length} matched items</span>
              </div>

              <button
                type="button"
                className="routes-new-button"
                onClick={() => navigate(`${APP_ROUTES.menuItems}/add`)}
              >
                <Plus size={15} />
                {MENU_ITEMS_PAGE_COPY.newButtonLabel}
              </button>
            </div>
          </div>
        </header>

        <MenuItemsOverview isLoading={apiState.isLoading} metrics={metrics} />
        {apiState.error ? <p className="month-balance-alert">{apiState.error}</p> : null}

        <AdminDataTable
          actions={
            <>
              <AdminTableButton
                className={apiState.isLoading ? 'opacity-60' : ''}
                disabled={apiState.isLoading}
                onClick={() => apiState.refresh()}
              >
                <RefreshCcw size={14} />
                Refresh
              </AdminTableButton>
              <button
                type="button"
                className="routes-new-button"
                onClick={() => navigate(`${APP_ROUTES.menuItems}/add`)}
              >
                <Plus size={15} />
                {MENU_ITEMS_PAGE_COPY.newButtonLabel}
              </button>
            </>
          }
          columns={menuItemsColumns}
          data={visibleItems}
          emptyMessage={
            activeTab === 'guide'
              ? 'No guide menu items found on this page.'
              : 'No admin menu items found on this page.'
          }
          filters={
            <div className="refund-filter-group">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`refund-filter-button ${activeTab === tab.key ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
          isLoading={apiState.isLoading}
          onPageChange={apiState.setPage}
          onSearchChange={(value) => {
            apiState.setPage(1)
            apiState.setSearch(value)
          }}
          pagination={apiState.pagination}
          renderRowActions={(item) => (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#332d30] bg-[#211d20] px-2.5 text-xs font-semibold text-[#dbe7fb] transition hover:bg-white/5"
                onClick={() => navigate(`${APP_ROUTES.menuItems}/update/${item.id}`)}
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={activeDeleteId === item.id}
                onClick={() => handleDelete(item)}
              >
                <Trash2 size={13} />
                {activeDeleteId === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
          resultLabel={resultLabel}
          rowActionsWidth="194px"
          search={apiState.search}
          searchPlaceholder={MENU_ITEMS_PAGE_COPY.searchPlaceholder}
        />
      </div>
    </main>
  )
}
