import { CircleDollarSign, Plus, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'
import ResourceCrudPage from '../../../components/crud/ResourceCrudPage'
import { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { AccountsOverview } from '../component/AccountsOverview.jsx'
import { accountColumns } from '../component/column.jsx'
import {
  ACCOUNT_FILTER_TABS,
  ACCOUNTS_PAGE_COPY,
  accountFields,
  toAccountPayload,
} from '../constants/accounts.constants'
import useAccounts from '../hooks/useAccounts'

export default function AccountsPage() {
  const apiState = useAccounts()

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No accounts found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched accounts`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  return (
    <ResourceCrudPage
      apiState={apiState}
      columns={accountColumns}
      emptyMessage="No accounts found for this view."
      fields={accountFields}
      filters={
        <div className="refund-filter-group">
          {ACCOUNT_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`refund-filter-button ${apiState.typeFilter === tab.key ? 'is-active' : ''}`}
              onClick={() => {
                apiState.setPage(1)
                apiState.setTypeFilter(tab.key)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
      formatSubmitValues={toAccountPayload}
      icon={CircleDollarSign}
      loadEditingItem={(account) => apiState.fetchAccountById(account.id)}
      newButtonLabel={ACCOUNTS_PAGE_COPY.newButtonLabel}
      renderActions={({ openCreateModal }) => (
        <>
          <AdminTableButton
            className={apiState.isLoading ? 'opacity-60' : ''}
            disabled={apiState.isLoading}
            onClick={() => apiState.refresh()}
          >
            <RefreshCcw size={14} />
            Refresh
          </AdminTableButton>
          <button type="button" className="routes-new-button" onClick={openCreateModal}>
            <Plus size={15} />
            {ACCOUNTS_PAGE_COPY.newButtonLabel}
          </button>
        </>
      )}
      resourceLabel="Account"
      resultLabel={resultLabel}
      rowActionsWidth="88px"
      searchPlaceholder={ACCOUNTS_PAGE_COPY.searchPlaceholder}
      showDeleteAction={false}
      subtitle={ACCOUNTS_PAGE_COPY.subtitle}
      title={ACCOUNTS_PAGE_COPY.title}
      topContent={
        <>
          <AccountsOverview isLoading={apiState.isLoading} metrics={apiState.metrics} />
          {apiState.error ? <p className="month-balance-alert">{apiState.error}</p> : null}
        </>
      }
    />
  )
}
