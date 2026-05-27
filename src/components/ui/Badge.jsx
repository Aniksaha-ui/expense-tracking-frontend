const badgeStyles = {
  Active: 'bg-emerald-500/10 text-emerald-400',
  Inactive: 'bg-amber-500/10 text-amber-400',
}

export function Badge({ children }) {
  return (
    <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${badgeStyles[children] ?? 'bg-slate-500/15 text-slate-200'}`}>
      {children}
    </span>
  )
}
