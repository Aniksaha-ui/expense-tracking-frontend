import {
  Banknote,
  BarChart3,
  Bus,
  CircleDollarSign,
  Compass,
  CreditCard,
  MapPinned,
  Package,
  Route,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import FullPageLoader from '../../../components/common/FullPageLoader'
import { DashboardSection } from '../../../components/ui/DashboardSection'
import { DASHBOARD_COPY } from '../constants/dashboard.constants'
import useDashboard from '../hooks/useDashboard'

const metricIcons = [Banknote, CreditCard, Route, Compass]
const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6']

function MetricCard({ metric, index }) {
  const Icon = metricIcons[index] ?? BarChart3

  return (
    <article className="rounded-lg border border-[#332d30] bg-[#231f21] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Icon size={20} />
        </span>
        <span className="rounded-full bg-[#171314] px-2.5 py-1 text-[11px] font-bold text-[#9fb2d0]">
          {metric.change}
        </span>
      </div>
      <p className="text-xs font-semibold text-[#8fa0bd]">{metric.label}</p>
      <p className="mt-2 text-2xl font-bold leading-none text-white">{metric.value}</p>
    </article>
  )
}

function ShareMeter({ item }) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-[#8fa0bd]">{item.shareLabel}</span>
        <span className="font-bold text-white">{item.share}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#171314]">
        <span
          className="block h-full rounded-full bg-blue-500"
          style={{ width: `${Math.min(item.share, 100)}%` }}
        />
      </div>
    </div>
  )
}

function TripOriginList({ items, isLoading }) {
  if (!items.length) {
    return (
      <div className="p-5 text-center text-sm font-medium text-[#8fa0bd]">
        {isLoading ? 'Loading trip origin data...' : 'No trip origin data available.'}
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#2d282b]">
      {items.map((item) => (
        <article key={item.id} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">{item.origin}</h4>
              <p className="mt-1 text-xs text-[#8fa0bd]">Trip coverage region</p>
            </div>
            <strong className="text-lg text-white">{item.tripCountLabel}</strong>
          </div>
          <ShareMeter item={item} />
        </article>
      ))}
    </div>
  )
}

function PaymentMethodList({ items, isLoading }) {
  if (!items.length) {
    return (
      <div className="p-5 text-center text-sm font-medium text-[#8fa0bd]">
        {isLoading ? 'Loading payment methods...' : 'No payment method data available.'}
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#2d282b]">
      {items.map((item) => (
        <article key={item.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">{item.paymentMethod}</h4>
              <p className="mt-1 text-xs text-[#8fa0bd]">{item.paymentHeldLabel} payments held</p>
            </div>
            <div className="text-right">
              <strong className="text-sm text-white">{item.totalAmountLabel}</strong>
              <p className="mt-1 text-xs text-[#8fa0bd]">{item.shareLabel}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function TripSalesChart({ tripSales }) {
  const items = tripSales.chartItems ?? []
  const total = tripSales.totalAmountLabel ?? 'BDT 0'

  return (
    <div className="grid min-h-[310px] grid-cols-1 items-center gap-5 p-4 sm:p-5 lg:grid-cols-[280px_1fr]">
      <div className="relative mx-auto h-[220px] w-full max-w-[280px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={items} dataKey="value" innerRadius={70} outerRadius={105} paddingAngle={2} stroke="none">
              {items.map((entry, index) => (
                <Cell key={entry.id} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#171314', border: '1px solid #332d30', color: '#fff' }}
              formatter={(value) => [`BDT ${new Intl.NumberFormat('en-US').format(Number(value) || 0)}`, 'Sales']}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-[#8fa0bd]">{tripSales.monthLabel}</span>
          <strong className="mt-1 text-lg text-white">{total}</strong>
        </div>
      </div>

      <div className="space-y-3">
        {tripSales.items?.length ? (
          tripSales.items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md bg-[#171314] p-3">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: chartColors[index % chartColors.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{item.tripName}</p>
                <p className="mt-1 text-xs text-[#8fa0bd]">{item.shareLabel}</p>
              </div>
              <strong className="text-sm text-white">{item.totalTransactionLabel}</strong>
            </div>
          ))
        ) : (
          <p className="text-center text-sm font-medium text-[#8fa0bd]">No trip sales data available.</p>
        )}
      </div>
    </div>
  )
}

function PackageMarginChart({ packageProfitMargin }) {
  const items = packageProfitMargin.chartItems ?? []

  return (
    <div className="p-5">
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} layout="vertical" margin={{ top: 8, right: 16, left: 12, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="label" width={150} tick={{ fill: '#9fb2d0', fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: '#171314' }}
              contentStyle={{ background: '#171314', border: '1px solid #332d30', color: '#fff' }}
              formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Margin']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {items.map((item, index) => (
                <Cell key={item.id} fill={chartColors[index % chartColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SummaryGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
      {items.map((item) => (
        <article key={item.id} className="rounded-md border border-[#2d282b] bg-[#171314] p-4">
          <p className="text-xs font-medium text-[#8fa0bd]">{item.label}</p>
          <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
        </article>
      ))}
    </div>
  )
}

function OperationsPulse({ totals, paymentCaptureRate }) {
  const pulseItems = [
    { label: 'Total transactions', value: totals.totalTransactions ?? '0', icon: BarChart3 },
    { label: 'Captured payments', value: totals.totalPayments ?? '0', icon: CreditCard },
    { label: 'Active tours', value: totals.totalTours ?? '0', icon: Route },
    { label: 'Vehicles in service', value: totals.totalVehicles ?? '0', icon: Bus },
  ]

  return (
    <div className="p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pulseItems.map((item) => (
          <div key={item.label} className="rounded-md bg-[#171314] p-4">
            <item.icon size={18} className="mb-3 text-blue-400" />
            <p className="text-xs text-[#8fa0bd]">{item.label}</p>
            <strong className="mt-2 block text-xl text-white">{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-[#2d282b] bg-[#171314] p-4">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-[#b4c5df]">Payment capture rate</span>
          <strong className="text-white">{paymentCaptureRate}%</strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#231f21]">
          <span
            className="block h-full rounded-full bg-emerald-500"
            style={{ width: `${Math.min(paymentCaptureRate, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-[#8fa0bd]">
          {totals.totalPayments ?? '0'} captured payments from {totals.totalTransactions ?? '0'} transactions.
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useDashboard()

  if (isLoading && !data) {
    return (
      <FullPageLoader
        message="Loading dashboard..."
        subtext="Fetching payment, trip, and package data."
      />
    )
  }

  const copy = data?.copy ?? DASHBOARD_COPY
  const metrics = data?.metrics ?? []
  const summaryStats = data?.summaryStats ?? []
  const tripOrigins = data?.tripOrigins ?? []
  const paymentMethods = data?.paymentMethods ?? []
  const packageProfitMargin = data?.packageProfitMargin ?? { items: [], chartItems: [] }
  const tripSales = data?.tripSales ?? { items: [], chartItems: [], monthLabel: 'Current month' }
  const totals = data?.totals ?? {}
  const paymentCaptureRate = data?.paymentCaptureRate ?? 0

  return (
    <main className="min-h-full bg-[#100d0e] px-4 py-5 text-white sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1920px]">
        <header className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <div className="flex items-center gap-2">
              <MapPinned size={21} className="text-[#4f83ff]" />
              <h1 className="text-2xl font-bold leading-none text-white">{copy.pageTitle}</h1>
            </div>
            <p className="mt-3 text-sm text-[#b4c5df]">{copy.pageSubtitle}</p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:w-auto">
            <div className="rounded-md border border-[#332d30] bg-[#231f21] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8fa0bd]">Monthly payments</p>
              <strong className="mt-1 block text-sm text-white">{totals.monthlyPayments ?? 'BDT 0'}</strong>
            </div>
            <div className="rounded-md border border-[#332d30] bg-[#231f21] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8fa0bd]">Capture rate</p>
              <strong className="mt-1 block text-sm text-white">{paymentCaptureRate}%</strong>
            </div>
            <div className="rounded-md border border-[#332d30] bg-[#231f21] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8fa0bd]">Trip sales</p>
              <strong className="mt-1 block text-sm text-white">{totals.currentMonthTripSales ?? 'BDT 0'}</strong>
            </div>
          </div>
        </header>

        <section className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </section>

        <section className="mb-7 grid grid-cols-1 gap-7 xl:grid-cols-[1.15fr_0.85fr]">
          <DashboardSection title="Current month trip sales" icon={<CircleDollarSign size={16} className="text-emerald-400" />}>
            <TripSalesChart tripSales={tripSales} />
          </DashboardSection>

          <DashboardSection title="Trip origin performance" icon={<Route size={16} className="text-blue-400" />}>
            <TripOriginList items={tripOrigins} isLoading={isLoading} />
          </DashboardSection>
        </section>

        <section className="mb-7 grid grid-cols-1 gap-7 xl:grid-cols-[1fr_1fr]">
          <DashboardSection
            title="Package profit margin"
            icon={<Package size={16} className="text-amber-400" />}
            action={<span className="text-xs font-bold text-[#8fa0bd]">{totals.packageAverageMargin ?? '0%'} avg</span>}
          >
            <PackageMarginChart packageProfitMargin={packageProfitMargin} />
          </DashboardSection>

          <DashboardSection title="Payment method analysis" icon={<CreditCard size={16} className="text-cyan-400" />}>
            <PaymentMethodList items={paymentMethods} isLoading={isLoading} />
          </DashboardSection>
        </section>

        <section className="grid grid-cols-1 gap-7 xl:grid-cols-[1fr_0.7fr]">
          <DashboardSection title="Operational inventory" icon={<Users size={16} className="text-blue-400" />}>
            <SummaryGrid items={summaryStats} />
          </DashboardSection>

          <DashboardSection title="Operations pulse" icon={<BarChart3 size={16} className="text-emerald-400" />}>
            <OperationsPulse totals={totals} paymentCaptureRate={paymentCaptureRate} />
          </DashboardSection>
        </section>
      </div>
    </main>
  )
}
