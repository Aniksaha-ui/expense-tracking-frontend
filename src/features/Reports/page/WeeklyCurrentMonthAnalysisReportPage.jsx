import { CalendarDays, Eye, FolderTree, ReceiptText, RefreshCcw, TrendingUp, Wallet, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminDataTable, { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { fetchTransactionsCollection, paginateTransactions } from '../../Transactions/service/transactionsService'
import { ReportsOverview } from '../component/ReportsOverview.jsx'
import { REPORTS_PAGE_COPY } from '../constants/reports.constants'
import { paginateReportRows } from '../service/reportsService'
import { useWeeklyCurrentMonthAnalysisReport } from '../hooks/useReports'

const weeklyCurrentMonthAnalysisColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '6%',
  },
  {
    id: 'week',
    label: 'Week',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.weekLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.calendarWeekLabel}</p>
      </div>
    ),
    width: '17%',
  },
  {
    id: 'range',
    label: 'Period',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.rangeLabel}</p>
        <p className="text-xs text-[#7d8ca5]">
          {item.weekStart} to {item.weekEnd}
        </p>
      </div>
    ),
    width: '25%',
  },
  {
    align: 'right',
    id: 'transaction_count',
    label: 'Transactions',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.transactionCountLabel}</span>,
    width: '12%',
  },
  {
    align: 'right',
    id: 'total_amount',
    label: 'Total Amount',
    render: (item) => <span className="text-sm font-semibold text-white">{item.totalAmountLabel}</span>,
    width: '16%',
  },
  {
    align: 'right',
    id: 'average_expense',
    label: 'Average Expense',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.averageExpenseLabel}</span>,
    width: '14%',
  },
  {
    align: 'right',
    id: 'share',
    label: 'Share',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.shareLabel}</span>,
    width: '10%',
  },
]

const buildMetricItems = (report) => [
  { icon: CalendarDays, label: 'Weeks In Month', tone: 'blue', value: report.weeksInMonthLabel },
  { icon: TrendingUp, label: 'Active Weeks', tone: 'cyan', value: report.activeWeeksLabel },
  { icon: ReceiptText, label: 'Transactions', tone: 'emerald', value: report.totalTransactionsLabel },
  { icon: Wallet, label: 'Total Spend', tone: 'amber', value: report.totalExpenseLabel },
]

const countFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})
const weeklyExpenseTransactionTypes = new Set(['EXPENSE', 'RECURRING'])

const drawerTabs = [
  { key: 'transactions', label: 'All Transactions', icon: ReceiptText },
  { key: 'categories', label: 'Group By Category', icon: FolderTree },
]

const categoryGroupColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '72px',
  },
  {
    id: 'category',
    label: 'Category',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.categoryLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.categoryTypeLabel}</p>
      </div>
    ),
    width: '30%',
  },
  {
    align: 'right',
    id: 'transactions',
    label: 'Transactions',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.transactionCountLabel}</span>,
    width: '18%',
  },
  {
    align: 'right',
    id: 'share',
    label: 'Share',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.shareLabel}</span>,
    width: '16%',
  },
  {
    align: 'right',
    id: 'total_amount',
    label: 'Total Amount',
    render: (item) => <span className="text-sm font-semibold text-white">{item.totalAmountLabel}</span>,
    width: '18%',
  },
  {
    align: 'right',
    id: 'average_amount',
    label: 'Average Amount',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.averageAmountLabel}</span>,
    width: '18%',
  },
]

const weeklyTransactionDrawerColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '72px',
  },
  {
    id: 'title',
    label: 'Title',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{item.noteLabel}</p>
        <p className="text-xs text-[#7d8ca5]">TXN #{item.id}</p>
      </div>
    ),
    width: '42%',
  },
  {
    id: 'category',
    label: 'Category',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.categoryLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.categoryTypeLabel}</p>
      </div>
    ),
    width: '28%',
  },
  {
    align: 'right',
    id: 'amount',
    label: 'Amount',
    render: (item) => (
      <span className={`text-sm font-semibold ${item.amountToneClassName}`}>{item.amountLabel}</span>
    ),
    width: '20%',
  },
]

const buildCategoryRows = (items = []) => {
  const groupedItems = items.reduce((groups, item) => {
    const groupKey = item.category_id ?? `uncategorized-${item.type}`
    const existingGroup = groups.get(groupKey)

    if (existingGroup) {
      existingGroup.totalAmountValue += item.amountValue
      existingGroup.transactionCount += 1
      return groups
    }

    groups.set(groupKey, {
      categoryLabel: item.categoryLabel,
      categoryTypeLabel: item.categoryTypeLabel,
      groupKey,
      totalAmountValue: item.amountValue,
      transactionCount: 1,
    })

    return groups
  }, new Map())

  const totalAmount = items.reduce((sum, item) => sum + item.amountValue, 0)

  return [...groupedItems.values()]
    .map((item) => {
      const share = totalAmount > 0 ? (item.totalAmountValue / totalAmount) * 100 : 0
      const averageAmount = item.transactionCount > 0 ? item.totalAmountValue / item.transactionCount : 0

      return {
        ...item,
        averageAmountLabel: `BDT ${currencyFormatter.format(averageAmount)}`,
        searchText: [item.categoryLabel, item.categoryTypeLabel, item.totalAmountValue, item.transactionCount]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
        shareLabel: `${share.toFixed(1)}%`,
        totalAmountLabel: `BDT ${currencyFormatter.format(item.totalAmountValue)}`,
        transactionCountLabel: countFormatter.format(item.transactionCount),
      }
    })
    .sort((firstItem, secondItem) => {
      if (firstItem.totalAmountValue !== secondItem.totalAmountValue) {
        return secondItem.totalAmountValue - firstItem.totalAmountValue
      }

      return firstItem.categoryLabel.localeCompare(secondItem.categoryLabel)
    })
}

export default function WeeklyCurrentMonthAnalysisReportPage() {
  const apiState = useWeeklyCurrentMonthAnalysisReport()
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [drawerActiveTab, setDrawerActiveTab] = useState('transactions')
  const [drawerSearch, setDrawerSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const [transactionPage, setTransactionPage] = useState(1)
  const [categoryPage, setCategoryPage] = useState(1)
  const [drawerItems, setDrawerItems] = useState([])
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [drawerError, setDrawerError] = useState('')

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return `No weekly rows found for ${apiState.report.monthLabel}.`
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} weekly rows for ${apiState.report.monthLabel}`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total, apiState.report.monthLabel])

  const closeDrawer = useCallback(() => {
    setSelectedWeek(null)
    setDrawerError('')
    setDrawerItems([])
    setDrawerLoading(false)
    setDrawerActiveTab('transactions')
    setDrawerSearch('')
    setCategorySearch('')
    setTransactionPage(1)
    setCategoryPage(1)
  }, [])

  useEffect(() => {
    if (!selectedWeek) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeDrawer()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeDrawer, selectedWeek])

  useEffect(() => {
    if (!selectedWeek?.weekStart || !selectedWeek?.weekEnd) {
      return undefined
    }

    let isActive = true

    const loadWeekTransactions = async () => {
      setDrawerLoading(true)
      setDrawerError('')

      try {
        const items = await fetchTransactionsCollection({
          fromDate: selectedWeek.weekStart,
          toDate: selectedWeek.weekEnd,
        })

        if (!isActive) {
          return
        }

        setDrawerItems(items.filter((item) => weeklyExpenseTransactionTypes.has(item.type)))
      } catch (loadError) {
        if (!isActive) {
          return
        }

        setDrawerItems([])
        setDrawerError(loadError.message || 'Unable to load transactions for this week.')
      } finally {
        if (isActive) {
          setDrawerLoading(false)
        }
      }
    }

    void loadWeekTransactions()

    return () => {
      isActive = false
    }
  }, [selectedWeek])

  const filteredTransactionItems = useMemo(() => {
    const normalizedSearch = drawerSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return drawerItems
    }

    return drawerItems.filter((item) => item.searchText.includes(normalizedSearch))
  }, [drawerItems, drawerSearch])

  const categoryRows = useMemo(() => buildCategoryRows(drawerItems), [drawerItems])

  const filteredCategoryRows = useMemo(() => {
    const normalizedSearch = categorySearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return categoryRows
    }

    return categoryRows.filter((item) => item.searchText.includes(normalizedSearch))
  }, [categoryRows, categorySearch])

  const transactionTableState = useMemo(
    () => paginateTransactions(filteredTransactionItems, transactionPage),
    [filteredTransactionItems, transactionPage],
  )

  const categoryTableState = useMemo(
    () => paginateReportRows(filteredCategoryRows, categoryPage),
    [filteredCategoryRows, categoryPage],
  )

  useEffect(() => {
    if (transactionPage > transactionTableState.pagination.lastPage) {
      setTransactionPage(transactionTableState.pagination.lastPage)
    }
  }, [transactionPage, transactionTableState.pagination.lastPage])

  useEffect(() => {
    if (categoryPage > categoryTableState.pagination.lastPage) {
      setCategoryPage(categoryTableState.pagination.lastPage)
    }
  }, [categoryPage, categoryTableState.pagination.lastPage])

  const transactionResultLabel = useMemo(() => {
    if (!transactionTableState.pagination.total) {
      return 'No transactions found for this week.'
    }

    return `Showing ${transactionTableState.pagination.from}-${transactionTableState.pagination.to} of ${transactionTableState.pagination.total} transactions`
  }, [transactionTableState.pagination.from, transactionTableState.pagination.to, transactionTableState.pagination.total])

  const categoryResultLabel = useMemo(() => {
    if (!categoryTableState.pagination.total) {
      return 'No category groups found for this week.'
    }

    return `Showing ${categoryTableState.pagination.from}-${categoryTableState.pagination.to} of ${categoryTableState.pagination.total} category groups`
  }, [categoryTableState.pagination.from, categoryTableState.pagination.to, categoryTableState.pagination.total])

  const drawerSummary = useMemo(() => {
    const totalAmount = drawerItems.reduce((sum, item) => sum + item.amountValue, 0)
    const uniqueCategories = new Set(drawerItems.map((item) => item.category_id).filter(Boolean))

    return {
      categoryCountLabel: countFormatter.format(uniqueCategories.size),
      totalAmountLabel: `BDT ${currencyFormatter.format(totalAmount)}`,
      transactionCountLabel: countFormatter.format(drawerItems.length),
    }
  }, [drawerItems])

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <TrendingUp size={20} color="#4f83ff" />
            <h1>{REPORTS_PAGE_COPY.weeklyCurrentMonthAnalysis.title}</h1>
          </div>
          <p className="routes-page__subtitle">{REPORTS_PAGE_COPY.weeklyCurrentMonthAnalysis.subtitle}</p>
        </header>

        <ReportsOverview isLoading={apiState.isLoading} items={buildMetricItems(apiState.report)} />

        <section className="mb-5 rounded-xl border border-[#332d30] bg-[#171314] p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="flex min-h-[84px] flex-col justify-center rounded-xl border border-[#2a2426] bg-[#120f10] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7ea1ff]">Reporting Month</p>
              <p className="mt-2 text-lg font-semibold text-white">{apiState.report.monthLabel}</p>
            </article>
            <article className="flex min-h-[84px] flex-col justify-center rounded-xl border border-[#2a2426] bg-[#120f10] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7ea1ff]">Covered Range</p>
              <p className="mt-2 text-lg font-semibold text-white">{apiState.report.dateRangeLabel}</p>
            </article>
          </div>
        </section>

        {apiState.error ? <p className="month-balance-alert">{apiState.error}</p> : null}

        <AdminDataTable
          actions={
            <AdminTableButton
              className={apiState.isLoading ? 'opacity-60' : ''}
              disabled={apiState.isLoading}
              onClick={() => void apiState.refresh()}
            >
              <RefreshCcw size={14} />
              Refresh
            </AdminTableButton>
          }
          columns={weeklyCurrentMonthAnalysisColumns}
          data={apiState.items}
          emptyMessage="No weekly current month analysis data found."
          filters={null}
          isLoading={apiState.isLoading}
          onPageChange={apiState.setPage}
          onSearchChange={(value) => {
            apiState.setPage(1)
            apiState.setSearch(value)
          }}
          pagination={apiState.pagination}
          renderRowActions={(item) => (
            <AdminTableButton
              className="whitespace-nowrap"
              onClick={() => {
                setSelectedWeek(item)
                setDrawerActiveTab('transactions')
                setDrawerSearch('')
                setCategorySearch('')
                setTransactionPage(1)
                setCategoryPage(1)
              }}
            >
              <Eye size={14} />
              View Transactions
            </AdminTableButton>
          )}
          resultLabel={resultLabel}
          rowActionsWidth="180px"
          search={apiState.search}
          searchPlaceholder={REPORTS_PAGE_COPY.weeklyCurrentMonthAnalysis.searchPlaceholder}
        />
      </div>

      {selectedWeek ? (
        <div className="report-drawer" role="dialog" aria-modal="true" aria-labelledby="weekly-report-drawer-title">
          <button
            type="button"
            className="report-drawer__backdrop"
            aria-label="Close weekly transactions drawer"
            onClick={closeDrawer}
          />
          <aside className="report-drawer__panel">
            <div className="report-drawer__header">
              <div>
                <p className="report-drawer__eyebrow">Weekly Transactions</p>
                <h2 id="weekly-report-drawer-title">{selectedWeek.weekLabel}</h2>
                <p className="report-drawer__subtitle">
                  {selectedWeek.rangeLabel} ({selectedWeek.weekStart} to {selectedWeek.weekEnd})
                </p>
              </div>
              <button type="button" className="report-drawer__close" onClick={closeDrawer}>
                <X size={14} />
                Close
              </button>
            </div>

            <div className="report-drawer__body">
              <section className="report-drawer__summary-grid">
                <article className="report-drawer__summary-card">
                  <span>Total Transactions</span>
                  <strong>{drawerSummary.transactionCountLabel}</strong>
                </article>
                <article className="report-drawer__summary-card">
                  <span>Total Amount</span>
                  <strong>{drawerSummary.totalAmountLabel}</strong>
                </article>
                <article className="report-drawer__summary-card">
                  <span>Categories</span>
                  <strong>{drawerSummary.categoryCountLabel}</strong>
                </article>
              </section>

              <div className="report-drawer__tabs" role="tablist" aria-label="Weekly transaction views">
                {drawerTabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = drawerActiveTab === tab.key

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`report-drawer__tab ${isActive ? 'is-active' : ''}`}
                      onClick={() => setDrawerActiveTab(tab.key)}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {drawerError ? <p className="month-balance-alert">{drawerError}</p> : null}

              <div className="report-drawer__table-card">
                {drawerActiveTab === 'transactions' ? (
                  <AdminDataTable
                    columns={weeklyTransactionDrawerColumns}
                    data={transactionTableState.rows}
                    emptyMessage="No transactions found for this week."
                    filters={null}
                    isLoading={drawerLoading}
                    onPageChange={setTransactionPage}
                    onSearchChange={(value) => {
                      setTransactionPage(1)
                      setDrawerSearch(value)
                    }}
                    pagination={transactionTableState.pagination}
                    resultLabel={transactionResultLabel}
                    search={drawerSearch}
                    searchPlaceholder="Search weekly transactions"
                  />
                ) : (
                  <AdminDataTable
                    columns={categoryGroupColumns}
                    data={categoryTableState.rows}
                    emptyMessage="No category groups found for this week."
                    filters={null}
                    isLoading={drawerLoading}
                    onPageChange={setCategoryPage}
                    onSearchChange={(value) => {
                      setCategoryPage(1)
                      setCategorySearch(value)
                    }}
                    pagination={categoryTableState.pagination}
                    resultLabel={categoryResultLabel}
                    search={categorySearch}
                    searchPlaceholder="Search grouped categories"
                  />
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  )
}
