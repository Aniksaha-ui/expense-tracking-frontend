import { PieChart, RefreshCcw, Tags } from 'lucide-react'
import { useMemo } from 'react'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { ReportsOverview } from '../component/ReportsOverview.jsx'
import { categoryBreakdownColumns } from '../component/reportColumns.jsx'
import { REPORT_CATEGORY_TYPE_OPTIONS, REPORTS_PAGE_COPY } from '../constants/reports.constants'
import { useCategoryBreakdownReport } from '../hooks/useReports'

const buildCategoryMetricItems = (metrics) => [
  { icon: Tags, label: 'Tracked Categories', tone: 'blue', value: metrics.totalCategoriesLabel },
  { icon: PieChart, label: 'Total Spend', tone: 'amber', value: metrics.totalSpendLabel },
  { icon: PieChart, label: 'Top Category', tone: 'cyan', value: metrics.topCategoryLabel },
  { icon: PieChart, label: 'Top Share', tone: 'emerald', value: metrics.topShareLabel },
]

export default function CategoryBreakdownReportPage() {
  const apiState = useCategoryBreakdownReport()

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No category breakdown records found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched categories`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  const hasFiltersApplied = apiState.fromDate || apiState.toDate || apiState.typeFilter !== 'all' || apiState.search

  const clearFilters = () => {
    apiState.setPage(1)
    apiState.setSearch('')
    apiState.setTypeFilter('all')
    apiState.setFromDate('')
    apiState.setToDate('')
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <PieChart size={20} color="#4f83ff" />
            <h1>{REPORTS_PAGE_COPY.categoryBreakdown.title}</h1>
          </div>
          <p className="routes-page__subtitle">{REPORTS_PAGE_COPY.categoryBreakdown.subtitle}</p>
        </header>

        <ReportsOverview isLoading={apiState.isLoading} items={buildCategoryMetricItems(apiState.metrics)} />

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="crud-field">
              <span>Category Type</span>
              <select
                value={apiState.typeFilter}
                onChange={(event) => {
                  apiState.setPage(1)
                  apiState.setTypeFilter(event.target.value)
                }}
              >
                {REPORT_CATEGORY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
            <AdminTableButton
              className={apiState.isLoading ? 'opacity-60' : ''}
              disabled={apiState.isLoading}
              onClick={() => void apiState.refresh()}
            >
              <RefreshCcw size={14} />
              Refresh
            </AdminTableButton>
          }
          columns={categoryBreakdownColumns}
          data={apiState.items}
          emptyMessage="No category breakdown data found for this view."
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
          searchPlaceholder={REPORTS_PAGE_COPY.categoryBreakdown.searchPlaceholder}
        />
      </div>
    </main>
  )
}
