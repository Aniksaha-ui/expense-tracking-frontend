import { ArrowRight, CalendarRange, GitCompareArrows, RefreshCcw, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { ReportDateRangeFilters } from '../component/ReportDateRangeFilters.jsx'
import { ReportsOverview } from '../component/ReportsOverview.jsx'
import { REPORTS_PAGE_COPY } from '../constants/reports.constants'
import { useCurrentVsPreviousMonthAnalysisReport } from '../hooks/useReports'

const comparisonColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '6%',
  },
  {
    id: 'period',
    label: 'Period',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.periodLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.rangeLabel}</p>
      </div>
    ),
    width: '24%',
  },
  {
    align: 'right',
    id: 'income',
    label: 'Income',
    render: (item) => <span className="text-sm text-emerald-200">{item.incomeLabel}</span>,
    width: '14%',
  },
  {
    align: 'right',
    id: 'expense',
    label: 'Expense',
    render: (item) => <span className="text-sm text-rose-200">{item.expenseLabel}</span>,
    width: '14%',
  },
  {
    align: 'right',
    id: 'recurring',
    label: 'Recurring',
    render: (item) => <span className="text-sm text-violet-200">{item.recurringLabel}</span>,
    width: '14%',
  },
  {
    align: 'right',
    id: 'total_outflow',
    label: 'Total Outflow',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.totalOutflowLabel}</span>,
    width: '14%',
  },
  {
    align: 'right',
    id: 'net',
    label: 'Net',
    render: (item) => (
      <span className={`text-sm font-semibold ${item.netValue >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
        {item.netLabel}
      </span>
    ),
    width: '14%',
  },
]

const buildMetricItems = (report) => [
  { icon: Wallet, label: 'Previous Net', tone: 'amber', value: report.previousNetLabel },
  { icon: TrendingUp, label: 'Current Net', tone: 'emerald', value: report.currentNetLabel },
  { icon: GitCompareArrows, label: 'Income Change', tone: 'blue', value: report.incomeChangeLabel },
  { icon: TrendingDown, label: 'Outflow Change', tone: 'cyan', value: report.totalOutflowChangeLabel },
]

function ComparisonChart({ graph, isLoading }) {
  const chartState = useMemo(() => {
    const labels = Array.isArray(graph.labels) ? graph.labels : []
    const datasets = Array.isArray(graph.datasets) ? graph.datasets : []
    const maxValue = graph.maxValue > 0 ? graph.maxValue : 1

    return { datasets, labels, maxValue }
  }, [graph])

  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-2xl border border-[#2a2426] bg-[#120f10]" />
  }

  if (!chartState.labels.length || !chartState.datasets.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-[#312a2d] bg-[#120f10] text-sm text-[#7d8ca5]">
        No chart data available for the selected comparison.
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#332d30] bg-[#171314]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a2426] px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7ea1ff]">Month-over-month movement</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Income and outflow comparison</h2>
          <p className="mt-1 text-sm text-[#8fa0bd]">Each group shows the same measure for both reporting months.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {chartState.datasets.map((dataset) => (
            <div key={dataset.label} className="inline-flex items-center gap-2 text-xs font-medium text-[#b7c6df]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: dataset.color }} />
              {dataset.label}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto p-5 sm:p-6">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[112px_repeat(2,minmax(0,1fr))] gap-x-5">
            <div className="flex h-64 flex-col justify-between pb-8 text-right text-[11px] font-medium text-[#71809b]">
              {[100, 75, 50, 25, 0].map((percentage) => (
                <span key={percentage}>BDT {Math.round((chartState.maxValue * percentage) / 100).toLocaleString('en-US')}</span>
              ))}
            </div>
            {chartState.labels.map((label, labelIndex) => (
              <div key={label} className="min-w-0">
                <div className="relative flex h-64 items-end justify-center gap-3 border-b border-l border-[#40373a] bg-[repeating-linear-gradient(to_bottom,transparent,transparent_calc(25%-1px),rgba(73,65,68,0.45)_calc(25%-1px),rgba(73,65,68,0.45)_25%)] px-4 pt-4">
                  {chartState.datasets.map((dataset) => {
                    const rawValue = Number(dataset.data?.[labelIndex] ?? 0)
                    const height = Math.max((rawValue / chartState.maxValue) * 100, rawValue > 0 ? 3 : 0)

                    return (
                      <div key={`${label}-${dataset.label}`} className="group relative flex h-full flex-1 items-end justify-center">
                        <div
                          className="w-full max-w-14 rounded-t-md transition-[height] duration-500 group-hover:brightness-125"
                          style={{ backgroundColor: dataset.color, height: `${height}%` }}
                          title={`${dataset.label}: BDT ${rawValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        />
                      </div>
                    )
                  })}
                </div>
                <p className="mt-3 text-center text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-center text-xs text-[#8290aa]">Reporting period</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CurrentVsPreviousMonthAnalysisReportPage() {
  const apiState = useCurrentVsPreviousMonthAnalysisReport()

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No month comparison rows found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} comparison rows`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#332d30] bg-[#171314] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <div className="routes-page__title">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#7ea1ff]">
                  <GitCompareArrows size={21} />
                </span>
                <h1>{REPORTS_PAGE_COPY.currentVsPreviousMonthAnalysis.title}</h1>
              </div>
              <p className="routes-page__subtitle">{REPORTS_PAGE_COPY.currentVsPreviousMonthAnalysis.subtitle}</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#2f3645] bg-[#120f10] px-3 py-2 text-xs font-medium text-[#b7c6df]">
              <CalendarRange size={15} className="text-[#7ea1ff]" />
              Two-month view
            </div>
          </div>
        </header>

        <ReportsOverview isLoading={apiState.isLoading} items={buildMetricItems(apiState.report)} />

        <section className="mb-5 rounded-2xl border border-[#332d30] bg-[#171314] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7ea1ff]">
            <CalendarRange size={15} /> Reporting window
          </div>
          <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(220px,0.9fr)]">
            <article className="flex min-h-[96px] flex-col justify-center rounded-xl border border-[#2a2426] bg-[#120f10] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fa0bd]">Previous month</p>
              <p className="mt-2 text-lg font-semibold text-white">{apiState.report.previousMonthLabel}</p>
            </article>
            <div className="hidden items-center justify-center lg:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#344261] bg-[#17214a] text-[#8eb0ff]">
                <ArrowRight size={17} />
              </span>
            </div>
            <article className="flex min-h-[96px] flex-col justify-center rounded-xl border border-blue-500/30 bg-[#121a2d] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#91b0ff]">Current month</p>
              <p className="mt-2 text-lg font-semibold text-white">{apiState.report.currentMonthLabel}</p>
            </article>
            <article className="flex min-h-[96px] flex-col justify-center rounded-xl border border-[#2a2426] bg-[#120f10] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8fa0bd]">Full range</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white">{apiState.report.monthRangeLabel}</p>
            </article>
          </div>
        </section>

        <div className="mb-5">
          <ComparisonChart graph={apiState.report.graph} isLoading={apiState.isLoading} />
        </div>

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
          columns={comparisonColumns}
          data={apiState.items}
          emptyMessage="No current vs previous month analysis data found."
          filters={<ReportDateRangeFilters apiState={apiState} />}
          isLoading={apiState.isLoading}
          onPageChange={apiState.setPage}
          onSearchChange={(value) => {
            apiState.setPage(1)
            apiState.setSearch(value)
          }}
          pagination={apiState.pagination}
          resultLabel={resultLabel}
          search={apiState.search}
          searchPlaceholder={REPORTS_PAGE_COPY.currentVsPreviousMonthAnalysis.searchPlaceholder}
        />
      </div>
    </main>
  )
}
