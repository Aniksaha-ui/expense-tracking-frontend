export function Card({ title, action, children, className = '', noPadding = false }) {
  return (
    <section className={`flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className={`flex-1 ${noPadding ? '' : 'p-5 sm:p-6'}`}>{children}</div>
    </section>
  )
}
