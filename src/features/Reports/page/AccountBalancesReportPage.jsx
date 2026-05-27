import { CircleDollarSign, PiggyBank, RefreshCcw, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { ReportsOverview } from '../component/ReportsOverview.jsx'
import { accountBalanceColumns } from '../component/reportColumns.jsx'
import { REPORT_ACCOUNT_TYPE_OPTIONS, REPORTS_PAGE_COPY } from '../constants/reports.constants'
import { useAccountBalancesReport } from '../hooks/useReports'

const buildAccountMetricItems = (metrics) => [
  { icon: Wallet, label: 'Total Accounts', tone: 'blue', value: metrics.totalCountLabel },
  { icon: CircleDollarSign, label: 'Active Accounts', tone: 'emerald', value: metrics.activeCountLabel },
  { icon: PiggyBank, label: 'Cash Accounts', tone: 'cyan', value: metrics.cashCountLabel },
  { icon: Wallet, label: 'Tracked Balance', tone: 'amber', value: metrics.totalBalanceLabel },
]

export default function AccountBalancesReportPage() {
  const apiState = useAccountBalancesReport()

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No account balances found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched accounts`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  const hasFiltersApplied = apiState.typeFilter !== 'all' || apiState.search

  const clearFilters = () => {
    apiState.setPage(1)
    apiState.setSearch('')
    apiState.setTypeFilter('all')
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <Wallet size={20} color="#4f83ff" />
            <h1>{REPORTS_PAGE_COPY.accountBalances.title}</h1>
          </div>
          <p className="routes-page__subtitle">{REPORTS_PAGE_COPY.accountBalances.subtitle}</p>
        </header>

        <ReportsOverview isLoading={apiState.isLoading} items={buildAccountMetricItems(apiState.metrics)} />

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="crud-field">
              <span>Account Type</span>
              <select
                value={apiState.typeFilter}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setTypeFilter(event.target.value)
                }}
              >
                {REPORT_ACCOUNT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            <AdminTableButton
              className={apiState.isLoading ? 'opacity-60' : ''}
              disabled={apiState.isLoading}
              onClick={() => void apiState.refresh()}
            >
              <RefreshCcw size={14} />
              Refresh
            </AdminTableButton>
          }
          columns={accountBalanceColumns}
          data={apiState.items}
          emptyMessage="No account balances found for this view."
          filters={null}
          isLoading={apiState.isLoading}
          onPageChange={apiState.setPage}
          onSearchChange={(value) => {
            apiState.setPage(1)
            apiState.setSearch(value)
          }}
          pagination={apiState.pagination}
          resultLabel={resultLabel}
          search={apiState.search}
          searchPlaceholder={REPORTS_PAGE_COPY.accountBalances.searchPlaceholder}
        />
      </div>
    </main>
  )
}
