import { PiggyBank, ReceiptText, TrendingDown, TrendingUp } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function TransactionsOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: ReceiptText,
      label: 'Total Transactions',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: TrendingUp,
      label: 'Income Total',
      tone: 'emerald',
      value: metrics.incomeTotalLabel,
    },
    {
      icon: TrendingDown,
      label: 'Expense Total',
      tone: 'amber',
      value: metrics.expenseTotalLabel,
    },
    {
      icon: PiggyBank,
      label: 'Deposits Total',
      tone: 'cyan',
      value: metrics.depositTotalLabel,
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
