import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  BarChart3,
  Landmark,
  RefreshCcw,
  Wallet,
} from 'lucide-react'
import { ReportsOverview } from '../component/ReportsOverview.jsx'
import { REPORTS_PAGE_COPY } from '../constants/reports.constants'
import { useSummaryReport } from '../hooks/useReports'

const buildSummaryMetricItems = (report) => [
  { icon: Wallet, label: 'Current Balance', tone: 'cyan', value: report.currentBalanceLabel },
  { icon: Landmark, label: 'Total Accounts', tone: 'blue', value: report.accountCountLabel },
  { icon: ArrowUpCircle, label: 'Income Total', tone: 'emerald', value: report.totalIncomeLabel },
  { icon: ArrowDownCircle, label: 'Expense Total', tone: 'amber', value: report.totalExpenseLabel },
  { icon: ArrowDownCircle, label: 'Withdraw Total', tone: 'amber', value: report.totalWithdrawLabel },
  { icon: ArrowLeftRight, label: 'Transfer Out', tone: 'blue', value: report.totalTransferOutLabel },
]

export default function SummaryReportPage() {
  const apiState = useSummaryReport()

  const hasFiltersApplied = apiState.fromDate || apiState.toDate

  const clearFilters = () => {
    apiState.setFromDate('')
    apiState.setToDate('')
  }

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <BarChart3 size={20} color="#4f83ff" />
            <h1>{REPORTS_PAGE_COPY.summary.title}</h1>
          </div>
          <p className="routes-page__subtitle">{REPORTS_PAGE_COPY.summary.subtitle}</p>
        </header>

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <label className="crud-field">
              <span>From Date</span>
              <input
                type="date"
                value={apiState.fromDate}
                onChange={(event) => apiState.setFromDate(event.target.value)}
              />
            </label>
            <label className="crud-field">
              <span>To Date</span>
              <input
                type="date"
                value={apiState.toDate}
                onChange={(event) => apiState.setToDate(event.target.value)}
              />
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <button
                type="button"
                className="crud-button crud-button--ghost"
                disabled={!hasFiltersApplied}
                onClick={clearFilters}
              >
                Clear Range
              </button>
              <button
                type="button"
                className="routes-new-button"
                disabled={apiState.isLoading}
                onClick={() => void apiState.refresh()}
              >
                <RefreshCcw size={15} />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {apiState.error ? <p className="month-balance-alert">{apiState.error}</p> : null}

        <ReportsOverview
          isLoading={apiState.isLoading}
          items={buildSummaryMetricItems(apiState.report)}
          sectionClassName="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        />

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-[#332d30] bg-[#171314] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7d8ca5]">Reporting Window</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#2d2629] bg-[#120f10] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7d8ca5]">From</p>
                <p className="mt-2 text-lg font-semibold text-white">{apiState.report.fromDateLabel}</p>
              </div>
              <div className="rounded-lg border border-[#2d2629] bg-[#120f10] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7d8ca5]">To</p>
                <p className="mt-2 text-lg font-semibold text-white">{apiState.report.toDateLabel}</p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-[#332d30] bg-[#171314] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#7d8ca5]">Movement Snapshot</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#2d2629] bg-[#120f10] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7d8ca5]">Net Movement</p>
                <p className={`mt-2 text-lg font-semibold ${apiState.report.netMovementTone}`}>
                  {apiState.report.netMovementLabel}
                </p>
              </div>
              <div className="rounded-lg border border-[#2d2629] bg-[#120f10] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7d8ca5]">Expense Pressure</p>
                <p className="mt-2 text-lg font-semibold text-white">{apiState.report.totalExpenseLabel}</p>
                <p className="mt-1 text-xs text-[#7d8ca5]">
                  Includes both one-time expenses and recurring expense runs.
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
