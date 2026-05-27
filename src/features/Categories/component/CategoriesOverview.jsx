import { CircleDollarSign, PiggyBank, ReceiptText, Tags } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function CategoriesOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: Tags,
      label: 'Total Categories',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: ReceiptText,
      label: 'Expense Categories',
      tone: 'amber',
      value: metrics.expenseCountLabel,
    },
    {
      icon: CircleDollarSign,
      label: 'Income Categories',
      tone: 'emerald',
      value: metrics.incomeCountLabel,
    },
    {
      icon: PiggyBank,
      label: 'Custom Categories',
      tone: 'cyan',
      value: metrics.customCountLabel,
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
