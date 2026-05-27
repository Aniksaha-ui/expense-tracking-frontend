import { CalendarCheck, Clock3, Landmark, WalletCards } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function RecurringExpensesOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: CalendarCheck,
      label: 'Total Plans',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: WalletCards,
      label: 'Active Plans',
      tone: 'emerald',
      value: metrics.activeCountLabel,
    },
    {
      icon: Clock3,
      label: 'Due Now',
      tone: 'amber',
      value: metrics.dueNowCountLabel,
    },
    {
      icon: Landmark,
      label: 'Scheduled Amount',
      tone: 'cyan',
      value: metrics.totalAmountLabel,
    },
  ]

  return (
    <section className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
