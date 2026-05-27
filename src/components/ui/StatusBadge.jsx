const statusStyles = {
  completed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-blue-50 text-blue-700',
  upcoming: 'bg-amber-50 text-amber-700',
}

export function StatusBadge({ status }) {
  const style = statusStyles[status.toLowerCase()] ?? 'bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${style}`}>
      {status}
    </span>
  )
}
