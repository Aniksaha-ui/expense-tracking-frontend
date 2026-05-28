import { ArrowLeftRight, Pencil, RefreshCcw, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { TransferEntryModal } from '../component/TransferEntryModal.jsx'
import { TransfersOverview } from '../component/TransfersOverview.jsx'
import { transferColumns } from '../component/column.jsx'
import { TRANSFER_FILTER_TABS, TRANSFERS_PAGE_COPY } from '../constants/transfers.constants'
import useTransfers from '../hooks/useTransfers'

const createActions = [
  {
    icon: ArrowLeftRight,
    label: 'New Transfer',
    value: 'TRANSFER',
  },
  {
    icon: Wallet,
    label: 'Withdraw To Cash',
    value: 'WITHDRAWAL',
  },
]

export default function TransfersPage() {
  const apiState = useTransfers()
  const toast = useToast()
  const [entryType, setEntryType] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No transfers found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched transfers`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  const hasFiltersApplied =
    apiState.flowFilter !== 'all' || apiState.accountFilter !== 'all' || apiState.fromDate || apiState.toDate || apiState.search

  const closeModal = () => {
    setEditingItem(null)
    setEntryType(null)
  }

  const openCreateModal = (nextEntryType) => {
    setEditingItem(null)
    setEntryType(nextEntryType)
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setEntryType(item.is_withdrawal ? 'WITHDRAWAL' : 'TRANSFER')
  }

  const handleCreate = async (nextEntryType, payload) => {
    try {
      if (editingItem) {
        await apiState.updateItem(editingItem.id, nextEntryType, payload)
      } else {
        await apiState.createItem(nextEntryType, payload)
      }

      closeModal()
    } catch (error) {
      toast.error(error.message || 'Unable to save transfer.')
    }
  }

  const clearFilters = () => {
    apiState.setPage(1)
    apiState.setFlowFilter('all')
    apiState.setAccountFilter('all')
    apiState.setFromDate('')
    apiState.setToDate('')
    apiState.setSearch('')
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <ArrowLeftRight size={20} color="#4f83ff" />
            <h1>{TRANSFERS_PAGE_COPY.title}</h1>
          </div>
          <p className="routes-page__subtitle">{TRANSFERS_PAGE_COPY.subtitle}</p>
        </header>

        <TransfersOverview isLoading={apiState.isLoading} metrics={apiState.metrics} />

        <div className="refund-filter-group mb-5">
          {TRANSFER_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`refund-filter-button ${apiState.flowFilter === tab.key ? 'is-active' : ''}`}
              onClick={() => {
                apiState.setPage(1)
                apiState.setFlowFilter(tab.key)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              <span>From Date</span>
              <input
                type="date"
                value={apiState.fromDate}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setFromDate(event.target.value)
                }}
              />
            </label>

            <label className="crud-field">
              <span>To Date</span>
              <input
                type="date"
                value={apiState.toDate}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setToDate(event.target.value)
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
              {createActions.map((action, index) => {
                const Icon = action.icon
                const disabled = apiState.isLoading || apiState.isMutating || apiState.accounts.length < 2

                if (index === 0) {
                  return (
                    <button
                      key={action.value}
                      type="button"
                      className="routes-new-button"
                      disabled={disabled}
                      onClick={() => openCreateModal(action.value)}
                    >
                      <Icon size={15} />
                      {action.label}
                    </button>
                  )
                }

                return (
                  <AdminTableButton
                    key={action.value}
                    className={disabled ? 'opacity-60' : ''}
                    disabled={disabled}
                    onClick={() => openCreateModal(action.value)}
                  >
                    <Icon size={14} />
                    {action.label}
                  </AdminTableButton>
                )
              })}
            </>
          }
          columns={transferColumns}
          data={apiState.items}
          emptyMessage="No transfers found for this view."
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
                className={`routes-icon-button ${apiState.isMutating ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Edit transfer"
                disabled={apiState.isMutating}
                onClick={() => openEditModal(item)}
              >
                <Pencil size={15} />
              </button>
            </div>
          )}
          resultLabel={resultLabel}
          rowActionsWidth="72px"
          search={apiState.search}
          searchPlaceholder={TRANSFERS_PAGE_COPY.searchPlaceholder}
        />

        {entryType ? (
          <TransferEntryModal
            accounts={apiState.accounts}
            defaultEntryType={entryType}
            editingItem={editingItem}
            isMutating={apiState.isMutating}
            onClose={closeModal}
            onSubmit={handleCreate}
          />
        ) : null}
      </div>
    </main>
  )
}
