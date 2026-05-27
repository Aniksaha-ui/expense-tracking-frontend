import { Banknote, CircleDollarSign, CreditCard, ShieldCheck } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function AccountsOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: CreditCard,
      label: 'Total Accounts',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: ShieldCheck,
      label: 'Active Accounts',
      tone: 'cyan',
      value: metrics.activeCountLabel,
    },
    {
      icon: Banknote,
      label: 'Cash Accounts',
      tone: 'emerald',
      value: metrics.cashCountLabel,
    },
    {
      icon: CircleDollarSign,
      label: 'Tracked Balance',
      tone: 'amber',
      value: metrics.totalBalanceLabel,
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
