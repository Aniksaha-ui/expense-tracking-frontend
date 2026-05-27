export function DashboardSection({ title, icon, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`rounded-lg border border-[#332d30] bg-[#231f21] ${className}`}>
      {(title || action) && (
        <header className="flex min-h-[50px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            {icon}
            <h3 className="truncate text-sm font-bold text-white">{title}</h3>
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
