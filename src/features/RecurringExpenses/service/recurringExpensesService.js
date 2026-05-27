import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { assertSuccessfulExecution, unwrapResponseData } from '../../../services/resourceApi'
import { fetchAccountsCollection } from '../../Accounts/service/accountsService'
import { fetchCategoriesCollection } from '../../Categories/service/categoriesService'

const RECURRING_PAGE_SIZE = 10

const countFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric',
})

const frequencyLabels = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
}

const frequencyToneClassNames = {
  DAILY: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100',
  WEEKLY: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  MONTHLY: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  YEARLY: 'border-violet-500/20 bg-violet-500/10 text-violet-100',
}

const frequencyOrder = {
  DAILY: 0,
  WEEKLY: 1,
  MONTHLY: 2,
  YEARLY: 3,
}

const getTodayDateKey = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDateLabel = (value, fallback = 'Not scheduled') => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateFormatter.format(date)
}

const formatDateTimeLabel = (value, fallback = 'Never') => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateTimeFormatter.format(date)
}

const toDateKey = (value) => {
  if (!value) {
    return ''
  }

  return String(value).trim().slice(0, 10)
}

const toTitleLabel = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const toNumber = (value) => Number(value) || 0
const toBoolean = (value) => value === true || value === 1 || value === '1'

const normalizeRecurringExpense = (item = {}) => {
  const frequency = String(item.frequency ?? 'MONTHLY')
    .trim()
    .toUpperCase()
  const isActive = toBoolean(item.is_active)
  const amountValue = toNumber(item.amount)
  const nextRunDateKey = toDateKey(item.next_run_date)
  const dueNow = isActive && nextRunDateKey && nextRunDateKey <= getTodayDateKey()
  const account = item.account ?? {}
  const category = item.category ?? {}

  return {
    account,
    account_id: account.id ?? null,
    accountLabel: account.name ?? 'Unknown account',
    accountTypeLabel: toTitleLabel(account.type ?? 'Unknown'),
    amount: item.amount ?? '0.00',
    amountLabel: `BDT ${currencyFormatter.format(amountValue)}`,
    amountValue,
    category,
    category_id: category.id ?? null,
    categoryLabel: category.name ?? 'Unknown category',
    categoryTypeLabel: toTitleLabel(category.type ?? 'Unknown'),
    dueNow,
    end_date: item.end_date,
    endDateLabel: formatDateLabel(item.end_date, 'No end date'),
    frequency,
    frequencyLabel: frequencyLabels[frequency] ?? frequency,
    frequencyToneClassName:
      frequencyToneClassNames[frequency] ?? 'border-blue-500/20 bg-blue-500/10 text-blue-100',
    id: item.id,
    is_active: isActive,
    last_run_at: item.last_run_at,
    lastRunAtLabel: formatDateTimeLabel(item.last_run_at),
    next_run_date: item.next_run_date,
    nextRunDateKey,
    nextRunDateLabel: formatDateLabel(item.next_run_date),
    note: String(item.note ?? '').trim(),
    noteLabel: String(item.note ?? '').trim() || 'No note added',
    searchText: [
      item.id,
      item.title,
      item.note,
      account.name,
      account.type,
      category.name,
      category.type,
      frequency,
      item.start_date,
      item.next_run_date,
      item.end_date,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    start_date: item.start_date,
    startDateLabel: formatDateLabel(item.start_date, 'Not available'),
    statusKey: !isActive ? 'inactive' : dueNow ? 'due' : 'active',
    statusLabel: !isActive ? 'Inactive' : dueNow ? 'Due Now' : 'Active',
    statusToneClassName: !isActive
      ? 'border-slate-500/20 bg-slate-500/10 text-slate-200'
      : dueNow
        ? 'border-amber-500/20 bg-amber-500/10 text-amber-100'
        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    title: item.title ?? 'Untitled recurring expense',
  }
}

const sortRecurringExpenses = (items = []) =>
  [...items].sort((firstItem, secondItem) => {
    const nextRunComparison =
      (firstItem.nextRunDateKey || '9999-12-31').localeCompare(secondItem.nextRunDateKey || '9999-12-31')

    if (nextRunComparison !== 0) {
      return nextRunComparison
    }

    const frequencyDifference =
      (frequencyOrder[firstItem.frequency] ?? Number.MAX_SAFE_INTEGER) -
      (frequencyOrder[secondItem.frequency] ?? Number.MAX_SAFE_INTEGER)

    if (frequencyDifference !== 0) {
      return frequencyDifference
    }

    return firstItem.title.localeCompare(secondItem.title)
  })

export const emptyRecurringExpenseMetrics = {
  activeCountLabel: '0',
  dueNowCountLabel: '0',
  totalAmountLabel: 'BDT 0.00',
  totalCountLabel: '0',
}

export const fetchRecurringExpensesCollection = async () => {
  const payload = await apiRequest(API_URLS.recurringExpenses.list)
  const data = unwrapResponseData(payload, 'Unable to load recurring expenses.')
  const items = Array.isArray(data) ? data : []

  return sortRecurringExpenses(items.map(normalizeRecurringExpense))
}

export const fetchRecurringExpenseDependencies = async () => {
  const [accounts, categories] = await Promise.all([
    fetchAccountsCollection(),
    fetchCategoriesCollection(),
  ])

  return {
    accounts,
    categories: categories.filter((category) => category.type === 'EXPENSE'),
  }
}

export const filterRecurringExpenses = (
  items = [],
  {
    accountFilter = 'all',
    categoryFilter = 'all',
    dueThrough = '',
    frequencyFilter = 'all',
    search = '',
    statusFilter = 'all',
  } = {},
) => {
  const normalizedSearch = String(search ?? '').trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !normalizedSearch || item.searchText.includes(normalizedSearch)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.is_active) ||
      (statusFilter === 'inactive' && !item.is_active)
    const matchesAccount =
      accountFilter === 'all' || String(item.account_id) === String(accountFilter)
    const matchesCategory =
      categoryFilter === 'all' || String(item.category_id) === String(categoryFilter)
    const matchesFrequency = frequencyFilter === 'all' || item.frequency === frequencyFilter
    const matchesDueThrough = !dueThrough || (item.nextRunDateKey && item.nextRunDateKey <= dueThrough)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesAccount &&
      matchesCategory &&
      matchesFrequency &&
      matchesDueThrough
    )
  })
}

export const paginateRecurringExpenses = (items = [], page = 1) => {
  const total = items.length
  const lastPage = Math.max(Math.ceil(total / RECURRING_PAGE_SIZE), 1)
  const currentPage = Math.min(Math.max(page, 1), lastPage)
  const from = total ? (currentPage - 1) * RECURRING_PAGE_SIZE + 1 : 0
  const to = total ? Math.min(currentPage * RECURRING_PAGE_SIZE, total) : 0
  const startIndex = total ? from - 1 : 0
  const rows = items
    .slice(startIndex, startIndex + RECURRING_PAGE_SIZE)
    .map((item, index) => ({
      ...item,
      serial: from + index,
    }))

  return {
    pagination: {
      currentPage,
      from,
      lastPage,
      to,
      total,
    },
    rows,
  }
}

export const buildRecurringExpenseMetrics = (items = []) => {
  const activeCount = items.filter((item) => item.is_active).length
  const dueNowCount = items.filter((item) => item.dueNow).length
  const totalAmount = items.reduce((sum, item) => sum + item.amountValue, 0)

  return {
    activeCountLabel: countFormatter.format(activeCount),
    dueNowCountLabel: countFormatter.format(dueNowCount),
    totalAmountLabel: `BDT ${currencyFormatter.format(totalAmount)}`,
    totalCountLabel: countFormatter.format(items.length),
  }
}

export const createRecurringExpense = async (payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.recurringExpenses.create, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to create recurring expense.',
  )

export const updateRecurringExpense = async (recurringExpenseId, payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.recurringExpenses.update(recurringExpenseId), {
      body: JSON.stringify(payload),
      method: 'PUT',
    }),
    'Unable to update recurring expense.',
  )

export const runRecurringExpense = async (recurringExpenseId, payload = {}) =>
  unwrapResponseData(
    await apiRequest(API_URLS.recurringExpenses.run(recurringExpenseId), {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to execute recurring expense.',
  )

export const runDueRecurringExpenses = async (payload = {}) =>
  unwrapResponseData(
    await apiRequest(API_URLS.recurringExpenses.runDue, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to execute due recurring expenses.',
  )
