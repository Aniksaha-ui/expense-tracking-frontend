import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export function StatCard({ title, value, trend, isPositive, icon: Icon }) {
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        {Icon && (
          <span className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Icon size={22} />
          </span>
        )}
      </div>
      <p className="mb-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
        <TrendIcon size={15} strokeWidth={2.5} />
        <span>{trend}</span>
        <span className="ml-1 text-slate-400">vs last month</span>
      </div>
    </article>
  )
}
