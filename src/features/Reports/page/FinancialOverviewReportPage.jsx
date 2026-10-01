import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3, CalendarRange, CircleDollarSign, RefreshCcw, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { apiRequest } from '../../../services/apiClient'
import { unwrapResponseData } from '../../../services/resourceApi'
import { API_URLS } from '../../../constants/apiUrls'
import AdminDataTable from '../../../components/ui/AdminDataTable'

const currency = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateLabel = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' })
const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })
const COLORS = ['#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#3b82f6']

const asNumber = (value) => Number(value) || 0
const money = (value) => `BDT ${currency.format(asNumber(value))}`
const inputDate = (date) => date.toISOString().slice(0, 10)
const defaultRange = () => {
  const now = new Date()
  return { fromDate: inputDate(new Date(now.getFullYear(), now.getMonth(), 1)), toDate: inputDate(now) }
}

function ChartCard({ children, subtitle, title }) {
  return (
    <section className="rounded-2xl border border-[#332d30] bg-[#171314] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7ea1ff]">Analytics</p>
      <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-[#8fa0bd]">{subtitle}</p>
      <div className="mt-5 h-72">{children}</div>
    </section>
  )
}

function TooltipContent({ active, label, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#43393d] bg-[#120f10] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-white">{label}</p>
      {payload.map((item) => <p key={item.name} style={{ color: item.color }}>{item.name}: {money(item.value)}</p>)}
    </div>
  )
}

export default function FinancialOverviewReportPage() {
  const initialRange = useMemo(defaultRange, [])
  const [fromDate, setFromDate] = useState(initialRange.fromDate)
  const [toDate, setToDate] = useState(initialRange.toDate)
  const [granularity, setGranularity] = useState('monthly')
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [report, setReport] = useState({ summary: {}, daily: [], costing_by_category: [], period: {} })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ from_date: fromDate, to_date: toDate, granularity })
      const data = unwrapResponseData(
        await apiRequest(`${API_URLS.reports.financialOverview}?${params}`),
        'Unable to load financial report.',
      )
      setReport({ summary: data?.summary ?? {}, daily: data?.daily ?? [], costing_by_category: data?.costing_by_category ?? [], period: data?.period ?? {} })
    } catch (loadError) {
      setError(loadError.message || 'Unable to load financial report.')
      setReport({ summary: {}, daily: [], costing_by_category: [], period: {} })
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, granularity, toDate])

  useEffect(() => { void loadReport() }, [loadReport])

  const daily = useMemo(() => report.daily.map((row) => ({
    ...row,
    label: row.date
      ? (granularity === 'monthly' ? monthLabel : dateLabel).format(new Date(`${row.date}T00:00:00`))
      : 'Unknown',
    income: asNumber(row.total_income),
    costing: asNumber(row.total_costing),
    opening: asNumber(row.opening_balance),
    closing: asNumber(row.closing_balance),
    openingBalanceLabel: money(row.opening_balance),
    incomeLabel: money(row.total_income),
    costingLabel: money(row.total_costing),
    netIncomeLabel: money(row.net_income),
    closingBalanceLabel: money(row.closing_balance),
    id: row.date,
  })), [granularity, report.daily])
  const categories = useMemo(() => report.costing_by_category.map((row, index) => ({
    ...row, value: asNumber(row.amount), color: COLORS[index % COLORS.length],
  })), [report.costing_by_category])
  const filteredDaily = useMemo(() => {
    const search = ledgerSearch.trim().toLowerCase()
    if (!search) return daily
    return daily.filter((row) => [row.label, row.openingBalanceLabel, row.incomeLabel, row.costingLabel, row.netIncomeLabel, row.closingBalanceLabel, row.transaction_count].join(' ').toLowerCase().includes(search))
  }, [daily, ledgerSearch])
  const metrics = [
    { icon: Wallet, label: 'Opening Balance', tone: 'text-cyan-300', value: money(report.summary.opening_balance) },
    { icon: Wallet, label: 'Closing Balance', tone: 'text-blue-300', value: money(report.summary.closing_balance) },
    { icon: TrendingUp, label: 'Total Income', tone: 'text-emerald-300', value: money(report.summary.total_income) },
    { icon: TrendingDown, label: 'Total Costing', tone: 'text-rose-300', value: money(report.summary.total_costing) },
    { icon: CircleDollarSign, label: 'Net Income', tone: asNumber(report.summary.net_income) >= 0 ? 'text-emerald-300' : 'text-rose-300', value: money(report.summary.net_income) },
  ]
  const ledgerColumns = useMemo(() => [
    { id: 'period', label: granularity === 'monthly' ? 'Month' : 'Date', render: (row) => <span className="font-semibold text-white">{row.label}</span>, width: '15%' },
    { id: 'opening', label: 'Opening Balance', accessor: 'openingBalanceLabel', align: 'right', width: '16%' },
    { id: 'income', label: 'Income', render: (row) => <span className="text-emerald-300">{row.incomeLabel}</span>, align: 'right', width: '14%' },
    { id: 'costing', label: 'Costing', render: (row) => <span className="text-rose-300">{row.costingLabel}</span>, align: 'right', width: '14%' },
    { id: 'net', label: 'Net Income', render: (row) => <span className={asNumber(row.net_income) >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{row.netIncomeLabel}</span>, align: 'right', width: '14%' },
    { id: 'closing', label: 'Closing Balance', render: (row) => <span className="font-semibold text-blue-200">{row.closingBalanceLabel}</span>, align: 'right', width: '16%' },
    { id: 'entries', label: 'Entries', accessor: 'transaction_count', align: 'right', width: '11%' },
  ], [granularity])

  return (
    <main className="routes-page">
      <div className="routes-page__inner space-y-5">
        <header className="rounded-2xl border border-[#332d30] bg-[#171314] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="routes-page__title"><BarChart3 size={21} color="#7ea1ff" /><h1>Financial Overview</h1></div>
              <p className="routes-page__subtitle">Portfolio balances, income and costing performance for one reporting window.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-[#2f3645] bg-[#120f10] px-3 py-2 text-xs text-[#b7c6df]"><CalendarRange size={15} className="text-[#7ea1ff]" /> {report.period.from_date || fromDate} to {report.period.to_date || toDate}</div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
            <label className="crud-field"><span>From date</span><input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
            <label className="crud-field"><span>To date</span><input type="date" min={fromDate} value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
            <label className="crud-field"><span>View by</span><select value={granularity} onChange={(event) => setGranularity(event.target.value)}><option value="monthly">Monthly</option><option value="daily">Daily</option></select></label>
            <button type="button" className="routes-new-button self-end" onClick={() => void loadReport()} disabled={isLoading}><RefreshCcw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh report</button>
          </div>
        </header>

        {error ? <p className="month-balance-alert">{error}</p> : null}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {metrics.map(({ icon: Icon, label, tone, value }) => <article key={label} className="rounded-xl border border-[#332d30] bg-[#171314] p-4"><Icon size={19} className={tone} /><p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#7d8ca5]">{label}</p><p className={`mt-2 text-lg font-bold ${tone}`}>{isLoading ? 'Loading...' : value}</p></article>)}
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <ChartCard title="Income vs costing" subtitle={`${granularity === 'monthly' ? 'Monthly' : 'Daily'} comparison of money earned against business and expense costs.`}>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={daily} margin={{ left: 5, right: 8 }}><CartesianGrid stroke="#352e31" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#8fa0bd', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: '#8fa0bd', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip content={<TooltipContent />} /><Legend /><Bar dataKey="income" name="Income" fill="#34d399" radius={[4, 4, 0, 0]} /><Bar dataKey="costing" name="Costing" fill="#fb7185" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Costing by category" subtitle="Which categories contribute the largest share of total costing.">
            {categories.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categories} dataKey="value" nameKey="category" innerRadius={58} outerRadius={95} paddingAngle={3}>{categories.map((row) => <Cell key={row.category} fill={row.color} />)}</Pie><Tooltip content={<TooltipContent />} /><Legend /></PieChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-sm text-[#7d8ca5]">No costing categories in this range.</div>}
          </ChartCard>
        </section>

        <ChartCard title="Opening vs closing balance" subtitle={`Compare the portfolio balance at the start and end of each ${granularity === 'monthly' ? 'month' : 'day'}.`}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={daily} margin={{ left: 5, right: 16 }}><CartesianGrid stroke="#352e31" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#8fa0bd', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: '#8fa0bd', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip content={<TooltipContent />} /><Legend /><Line type="monotone" dataKey="opening" name="Opening balance" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa' }} /><Line type="monotone" dataKey="closing" name="Closing balance" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3, fill: '#60a5fa' }} /></LineChart></ResponsiveContainer>
        </ChartCard>

        <section className="overflow-hidden rounded-2xl border border-[#332d30] bg-[#171314]">
          <div className="border-b border-[#2a2426] px-5 py-4 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7ea1ff]">Table view</p><h2 className="mt-1 text-lg font-semibold text-white">{granularity === 'monthly' ? 'Monthly' : 'Daily'} financial ledger</h2><p className="mt-1 text-sm text-[#8fa0bd]">Opening and closing balances with each {granularity === 'monthly' ? 'month’s' : 'day’s'} income and costing.</p></div>
          <AdminDataTable columns={ledgerColumns} data={filteredDaily} getRowKey={(row) => row.id} isLoading={isLoading} emptyMessage="No transactions found in the selected period." onSearchChange={setLedgerSearch} resultLabel={`${filteredDaily.length} ${granularity === 'monthly' ? 'monthly' : 'daily'} ledger row${filteredDaily.length === 1 ? '' : 's'}`} search={ledgerSearch} searchPlaceholder="Search period or amount" />
        </section>
      </div>
    </main>
  )
}
