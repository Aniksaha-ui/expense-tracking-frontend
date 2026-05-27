import { ArrowDownToLine, ArrowLeftRight, Landmark, Wallet } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function TransfersOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: ArrowLeftRight,
      label: 'Total Transfers',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: Landmark,
      label: 'Standard Transfers',
      tone: 'cyan',
      value: metrics.transferCountLabel,
    },
    {
      icon: Wallet,
      label: 'Cash Withdrawals',
      tone: 'amber',
      value: metrics.withdrawalCountLabel,
    },
    {
      icon: ArrowDownToLine,
      label: 'Moved Amount',
      tone: 'emerald',
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
