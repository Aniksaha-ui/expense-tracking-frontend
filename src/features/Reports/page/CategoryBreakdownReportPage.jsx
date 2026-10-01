import { Eye, EyeOff, PieChart, RefreshCcw, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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

const chartColors = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#22d3ee', '#fb923c', '#94a3b8']

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload

  return (
    <div className="rounded-lg border border-[#43393d] bg-[#120f10] px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-white">{row.categoryName}</p>
      <p className="mt-1 text-[#9ec5ff]">{row.totalAmountLabel}</p>
      <p className="mt-1 text-[#a6b4ca]">{row.shareLabel} of report spend</p>
    </div>
  )
}

export default function CategoryBreakdownReportPage() {
  const apiState = useCategoryBreakdownReport()
  const [hiddenCategoryIds, setHiddenCategoryIds] = useState([])

  const chartItems = useMemo(
    () => apiState.chartItems.map((item, index) => ({ ...item, color: chartColors[index % chartColors.length] })),
    [apiState.chartItems],
  )
  const visibleChartItems = useMemo(
    () => chartItems.filter((item) => !hiddenCategoryIds.includes(String(item.categoryIdLabel))),
    [chartItems, hiddenCategoryIds],
  )
  const toggleCategoryVisibility = (categoryId) => {
    const id = String(categoryId)
    setHiddenCategoryIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No category breakdown records found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched categories`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  const hasFiltersApplied =
    apiState.fromDate !== apiState.defaultDateRange.fromDate ||
    apiState.toDate !== apiState.defaultDateRange.toDate ||
    apiState.typeFilter !== 'all' ||
    Boolean(apiState.search)

  const clearFilters = () => {
    apiState.setPage(1)
    apiState.setSearch('')
    apiState.setTypeFilter('all')
    apiState.setFromDate(apiState.defaultDateRange.fromDate)
    apiState.setToDate(apiState.defaultDateRange.toDate)
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

        <section className="mb-5 rounded-2xl border border-[#332d30] bg-[#171314] p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7ea1ff]">Visual breakdown</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Spend by category</h2>
              <p className="mt-1 text-sm text-[#8fa0bd]">Select a category below to hide or show it in the graph. Your table data stays unchanged.</p>
            </div>
            {hiddenCategoryIds.length ? <button type="button" className="crud-button crud-button--ghost shrink-0" onClick={() => setHiddenCategoryIds([])}>Show all</button> : null}
          </div>

          <div className="mt-5 h-72">
            {visibleChartItems.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visibleChartItems} layout="vertical" margin={{ top: 4, right: 24, left: 12, bottom: 4 }}>
                  <CartesianGrid stroke="#352e31" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#8fa0bd', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => `৳${Math.round(value / 1000)}k`} />
                  <YAxis type="category" dataKey="categoryName" width={105} tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#ffffff08' }} content={<CategoryTooltip />} />
                  <Bar dataKey="totalAmountValue" name="Spend" radius={[0, 5, 5, 0]}>
                    {visibleChartItems.map((item) => <Cell key={item.categoryIdLabel} fill={item.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[#3b3538] text-sm text-[#8fa0bd]">All categories are hidden. Select “Show all” to restore the graph.</div>}
          </div>

          {chartItems.length ? <div className="mt-5 flex flex-wrap gap-2 border-t border-[#2a2426] pt-4">
            {chartItems.map((item) => {
              const hidden = hiddenCategoryIds.includes(String(item.categoryIdLabel))
              return <button key={item.categoryIdLabel} type="button" aria-pressed={!hidden} onClick={() => toggleCategoryVisibility(item.categoryIdLabel)} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${hidden ? 'border-[#3b3538] bg-[#120f10] text-[#748196]' : 'border-[#4a628e] bg-[#1b2739] text-[#dbe7fb]'}`}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                {item.categoryName}
              </button>
            })}
          </div> : null}
        </section>

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
