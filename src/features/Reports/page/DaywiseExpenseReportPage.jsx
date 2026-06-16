import { CalendarDays, PieChart, ReceiptText, RefreshCcw } from 'lucide-react'
import { useMemo } from 'react'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { ReportsOverview } from '../component/ReportsOverview.jsx'
import { daywiseExpenseColumns } from '../component/reportColumns.jsx'
import { REPORTS_PAGE_COPY } from '../constants/reports.constants'
import { useDaywiseExpenseReport } from '../hooks/useReports'

const buildDaywiseExpenseMetricItems = (metrics) => [
  { icon: CalendarDays, label: 'Report Days', tone: 'blue', value: metrics.totalDaysLabel },
  { icon: PieChart, label: 'Tracked Categories', tone: 'cyan', value: metrics.totalCategoriesLabel },
  { icon: ReceiptText, label: 'Expense Transactions', tone: 'emerald', value: metrics.totalTransactionsLabel },
  { icon: PieChart, label: 'Total Spend', tone: 'amber', value: metrics.totalSpendLabel },
]

export default function DaywiseExpenseReportPage() {
  const apiState = useDaywiseExpenseReport()

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No daywise expense records found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched daywise expense rows`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  const hasFiltersApplied =
    apiState.fromDate !== apiState.defaultDateRange.fromDate ||
    apiState.toDate !== apiState.defaultDateRange.toDate ||
    Boolean(apiState.search)

  const clearFilters = () => {
    apiState.setPage(1)
    apiState.setSearch('')
    apiState.setFromDate(apiState.defaultDateRange.fromDate)
    apiState.setToDate(apiState.defaultDateRange.toDate)
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <CalendarDays size={20} color="#4f83ff" />
            <h1>{REPORTS_PAGE_COPY.daywiseExpenses.title}</h1>
          </div>
          <p className="routes-page__subtitle">{REPORTS_PAGE_COPY.daywiseExpenses.subtitle}</p>
        </header>

        <ReportsOverview isLoading={apiState.isLoading} items={buildDaywiseExpenseMetricItems(apiState.metrics)} />

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            <AdminTableButton
              className={apiState.isLoading ? 'opacity-60' : ''}
              disabled={apiState.isLoading}
              onClick={() => void apiState.refresh()}
            >
              <RefreshCcw size={14} />
              Refresh
            </AdminTableButton>
          }
          columns={daywiseExpenseColumns}
          data={apiState.items}
          emptyMessage="No daywise expense data found for this view."
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
          searchPlaceholder={REPORTS_PAGE_COPY.daywiseExpenses.searchPlaceholder}
        />
      </div>
    </main>
  )
}
