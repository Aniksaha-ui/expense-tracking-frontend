import { CalendarCheck, Pencil, Play, Plus, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { RecurringExpenseFormModal } from '../component/RecurringExpenseFormModal.jsx'
import { RecurringExpensesOverview } from '../component/RecurringExpensesOverview.jsx'
import { recurringExpenseColumns } from '../component/column.jsx'
import {
  RECURRING_FREQUENCY_OPTIONS,
  RECURRING_PAGE_COPY,
  RECURRING_STATUS_TABS,
} from '../constants/recurringExpenses.constants'
import useRecurringExpenses from '../hooks/useRecurringExpenses'

const getTodayDateKey = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function RecurringExpensesPage() {
  const apiState = useRecurringExpenses()
  const toast = useToast()
  const [editingItem, setEditingItem] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No recurring expenses found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched recurring expenses`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  const hasFiltersApplied =
    apiState.statusFilter !== 'all' ||
    apiState.accountFilter !== 'all' ||
    apiState.categoryFilter !== 'all' ||
    apiState.frequencyFilter !== 'all' ||
    apiState.dueThrough ||
    apiState.search

  const openCreateModal = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const closeModal = () => {
    setEditingItem(null)
    setModalOpen(false)
  }

  const clearFilters = () => {
    apiState.setPage(1)
    apiState.setStatusFilter('all')
    apiState.setAccountFilter('all')
    apiState.setCategoryFilter('all')
    apiState.setFrequencyFilter('all')
    apiState.setDueThrough('')
    apiState.setSearch('')
  }

  const handleSubmit = async (payload) => {
    try {
      if (editingItem) {
        await apiState.updateItem(editingItem.id, payload)
      } else {
        await apiState.createItem(payload)
      }

      closeModal()
    } catch (error) {
      toast.error(error.message || 'Unable to save recurring expense.')
    }
  }

  const handleRunItem = async (item) => {
    try {
      await apiState.runItem(item.id)
    } catch (error) {
      toast.error(error.message || 'Unable to execute recurring expense.')
    }
  }

  const handleRunDue = async () => {
    try {
      const payload = apiState.dueThrough ? { through_date: apiState.dueThrough } : { through_date: getTodayDateKey() }
      await apiState.runDueItems(payload)
    } catch (error) {
      toast.error(error.message || 'Unable to execute due recurring expenses.')
    }
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <CalendarCheck size={20} color="#4f83ff" />
            <h1>{RECURRING_PAGE_COPY.title}</h1>
          </div>
          <p className="routes-page__subtitle">{RECURRING_PAGE_COPY.subtitle}</p>
        </header>

        <RecurringExpensesOverview isLoading={apiState.isLoading} metrics={apiState.metrics} />

        <div className="refund-filter-group mb-5">
          {RECURRING_STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`refund-filter-button ${apiState.statusFilter === tab.key ? 'is-active' : ''}`}
              onClick={() => {
                apiState.setPage(1)
                apiState.setStatusFilter(tab.key)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="crud-field">
              <span>Account</span>
              <select
                value={apiState.accountFilter}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setAccountFilter(event.target.value)
                }}
              >
                <option value="all">All accounts</option>
                {apiState.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.typeLabel})
                  </option>
                ))}
              </select>
            </label>

            <label className="crud-field">
              <span>Category</span>
              <select
                value={apiState.categoryFilter}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setCategoryFilter(event.target.value)
                }}
              >
                <option value="all">All expense categories</option>
                {apiState.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="crud-field">
              <span>Frequency</span>
              <select
                value={apiState.frequencyFilter}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setFrequencyFilter(event.target.value)
                }}
              >
                <option value="all">All frequencies</option>
                {RECURRING_FREQUENCY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="crud-field">
              <span>Due Through</span>
              <input
                type="date"
                value={apiState.dueThrough}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setDueThrough(event.target.value)
                }}
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="crud-button crud-button--ghost w-full"
                disabled={!hasFiltersApplied}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </section>

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
              <AdminTableButton
                className={apiState.isLoading || apiState.isMutating ? 'opacity-60' : ''}
                disabled={apiState.isLoading || apiState.isMutating}
                onClick={() => void handleRunDue()}
              >
                <Play size={14} />
                Run Due
              </AdminTableButton>
              <button
                type="button"
                className="routes-new-button"
                disabled={apiState.isLoading || apiState.isMutating || !apiState.accounts.length || !apiState.categories.length}
                onClick={openCreateModal}
              >
                <Plus size={15} />
                New Recurring Expense
              </button>
            </>
          }
          columns={recurringExpenseColumns}
          data={apiState.items}
          emptyMessage="No recurring expenses found for this view."
          filters={null}
          isLoading={apiState.isLoading}
          onPageChange={apiState.setPage}
          onSearchChange={(value) => {
            apiState.setPage(1)
            apiState.setSearch(value)
          }}
          pagination={apiState.pagination}
          renderRowActions={(item) => (
            <div className="routes-table__actions">
              <button
                type="button"
                className="routes-icon-button"
                aria-label="Edit recurring expense"
                onClick={() => openEditModal(item)}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                className={`routes-icon-button ${!item.is_active || apiState.isMutating ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Run recurring expense"
                disabled={!item.is_active || apiState.isMutating}
                onClick={() => void handleRunItem(item)}
              >
                <Play size={15} />
              </button>
            </div>
          )}
          resultLabel={resultLabel}
          rowActionsWidth="96px"
          search={apiState.search}
          searchPlaceholder={RECURRING_PAGE_COPY.searchPlaceholder}
        />

        {modalOpen ? (
          <RecurringExpenseFormModal
            accounts={apiState.accounts}
            categories={apiState.categories}
            editingItem={editingItem}
            isMutating={apiState.isMutating}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </main>
  )
}
