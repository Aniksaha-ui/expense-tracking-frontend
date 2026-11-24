import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function ReportsOverview({ isLoading, items, sectionClassName = 'mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4' }) {
  return (
    <section className={`overview-scroll ${sectionClassName}`}>
      {items.map((item) => (
        <DashboardMetricCard
          key={item.label}
          icon={item.icon}
          label={item.label}
          tone={item.tone}
          value={isLoading ? '...' : item.value}
        />
      ))}
    </section>
  )
}
