const toneStyles = {
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-emerald-500/10 text-emerald-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  amber: 'bg-amber-500/10 text-amber-400',
}

export function DashboardMetricCard({ label, value, icon: Icon, tone = 'blue' }) {
  return (
    <article className="flex h-[76px] items-center gap-4 rounded-lg border border-[#332d30] bg-[#231f21] px-5">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <div>
        <p className="text-[12px] font-medium text-[#8fa0bd]">{label}</p>
        <p className="mt-1 text-base font-bold leading-none text-white">{value}</p>
      </div>
    </article>
  )
}
