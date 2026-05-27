import { LayoutPanelLeft, Menu, ShieldCheck, UserRound } from 'lucide-react'
import { DashboardMetricCard } from '../../../components/ui/DashboardMetricCard'

export function MenuItemsOverview({ isLoading, metrics }) {
  const items = [
    {
      icon: Menu,
      label: 'Matched Items',
      tone: 'blue',
      value: metrics.totalCountLabel,
    },
    {
      icon: ShieldCheck,
      label: 'Admin Entries',
      tone: 'cyan',
      value: metrics.adminCountLabel,
    },
    {
      icon: UserRound,
      label: 'Guide Entries',
      tone: 'emerald',
      value: metrics.guideCountLabel,
    },
    {
      icon: LayoutPanelLeft,
      label: 'Sidebar Items',
      tone: 'amber',
      value: metrics.sidebarCountLabel,
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
