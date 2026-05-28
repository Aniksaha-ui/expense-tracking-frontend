import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { assertSuccessfulExecution, unwrapResponseData } from '../../../services/resourceApi'
import { fetchAccountsCollection } from '../../Accounts/service/accountsService'
import { fetchCategoriesCollection } from '../../Categories/service/categoriesService'

const TRANSACTION_PAGE_SIZE = 10

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

const positiveTypes = new Set(['OPENING_BALANCE', 'INCOME', 'DEPOSIT'])
const negativeTypes = new Set(['EXPENSE', 'WITHDRAW', 'RECURRING'])

const transactionTypeLabels = {
  DEPOSIT: 'Deposit',
  EXPENSE: 'Expense',
  INCOME: 'Income',
  OPENING_BALANCE: 'Opening Balance',
  RECURRING: 'Recurring',
  TRANSFER: 'Transfer',
  WITHDRAW: 'Withdraw',
}

const transactionTypeToneClassNames = {
  DEPOSIT: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100',
  EXPENSE: 'border-rose-500/20 bg-rose-500/10 text-rose-100',
  INCOME: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  OPENING_BALANCE: 'border-sky-500/20 bg-sky-500/10 text-sky-100',
  RECURRING: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  TRANSFER: 'border-violet-500/20 bg-violet-500/10 text-violet-100',
  WITHDRAW: 'border-orange-500/20 bg-orange-500/10 text-orange-100',
}

const entryEndpointMap = {
  DEPOSIT: API_URLS.transactions.deposit,
  EXPENSE: API_URLS.transactions.expense,
  INCOME: API_URLS.transactions.income,
}

const transactionUpdateCandidates = (transactionId) => [
  { endpoint: API_URLS.transactions.update(transactionId), method: 'PUT' },
  { endpoint: API_URLS.transactions.update(transactionId), method: 'PATCH' },
  { endpoint: `/transactions/update/${transactionId}`, method: 'PUT' },
  { endpoint: `/transactions/update/${transactionId}`, method: 'PATCH' },
  { endpoint: `/transactions/update/${transactionId}`, method: 'POST' },
]

const isRetryableUpdateError = (error) => {
  const message = String(error?.message ?? '').trim().toLowerCase()

  return (
    message.includes('could not be found') ||
    message.includes('not supported for route') ||
    message.includes('supported methods')
  )
}

const updateTransactionRequest = async (transactionId, payload) => {
  let lastError = null

  for (const candidate of transactionUpdateCandidates(transactionId)) {
    try {
      return await apiRequest(candidate.endpoint, {
        body: JSON.stringify(payload),
        method: candidate.method,
      })
    } catch (error) {
      lastError = error

      if (!isRetryableUpdateError(error)) {
        throw error
      }
    }
  }

  throw lastError ?? new Error('Unable to update transaction.')
}

const toNumber = (value) => Number(value) || 0

const toDateKey = (value) => {
  if (!value) {
    return ''
  }

  const rawValue = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}/.test(rawValue)) {
    return rawValue.slice(0, 10)
  }

  const date = new Date(rawValue)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDateLabel = (value) => {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateFormatter.format(date)
}

const toTitleLabel = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const normalizeTransaction = (item = {}) => {
  const normalizedType = String(item.type ?? 'EXPENSE')
    .trim()
    .toUpperCase()
  const account = item.account ?? {}
  const category = item.category ?? null
  const relatedAccount = item.related_account ?? null
  const amountValue = toNumber(item.amount)
  const balanceAfterValue = toNumber(item.balance_after)
  const balanceBeforeValue = toNumber(item.balance_before)
  const direction = positiveTypes.has(normalizedType)
    ? 'credit'
    : negativeTypes.has(normalizedType)
      ? 'debit'
      : 'neutral'
  const amountPrefix = direction === 'debit' ? '-' : direction === 'credit' ? '+' : ''
  const amountToneClassName =
    direction === 'credit'
      ? 'text-emerald-300'
      : direction === 'debit'
        ? 'text-rose-300'
        : 'text-cyan-200'

  return {
    account_id: account.id ?? null,
    accountLabel: account.name ?? 'Unknown account',
    accountTypeLabel: toTitleLabel(account.type ?? 'Unknown'),
    amount: item.amount ?? '0.00',
    amountLabel: `${amountPrefix}BDT ${currencyFormatter.format(amountValue)}`,
    amountToneClassName,
    amountValue,
    balanceAfterLabel: `BDT ${currencyFormatter.format(balanceAfterValue)}`,
    balanceAfterValue,
    balanceBeforeLabel: `BDT ${currencyFormatter.format(balanceBeforeValue)}`,
    category_id: category?.id ?? null,
    categoryLabel:
      category?.name ??
      (normalizedType === 'DEPOSIT' ? 'No category required' : 'Uncategorized'),
    categoryTypeLabel: category?.type ? toTitleLabel(category.type) : 'N/A',
    id: item.id,
    note: String(item.note ?? '').trim(),
    noteLabel: String(item.note ?? '').trim() || 'No note added',
    referenceLabel: item.reference_type
      ? `${item.reference_type}${item.reference_id ? ` #${item.reference_id}` : ''}`
      : 'Manual entry',
    relatedAccountLabel: relatedAccount?.name
      ? `${relatedAccount.name} (${toTitleLabel(relatedAccount.type ?? '')})`
      : 'Not linked',
    searchText: [
      item.id,
      normalizedType,
      transactionTypeLabels[normalizedType],
      account.name,
      account.type,
      category?.name,
      category?.type,
      relatedAccount?.name,
      item.note,
      item.reference_type,
      item.reference_id,
      item.transaction_date,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    transaction_date: item.transaction_date,
    transactionDateKey: toDateKey(item.transaction_date),
    transactionDateLabel: formatDateLabel(item.transaction_date),
    type: normalizedType,
    typeLabel: transactionTypeLabels[normalizedType] ?? toTitleLabel(normalizedType),
    typeToneClassName:
      transactionTypeToneClassNames[normalizedType] ??
      'border-blue-500/20 bg-blue-500/10 text-blue-100',
  }
}

const sortTransactions = (items = []) =>
  [...items].sort((firstItem, secondItem) => {
    if (firstItem.transactionDateKey !== secondItem.transactionDateKey) {
      return secondItem.transactionDateKey.localeCompare(firstItem.transactionDateKey)
    }

    return (secondItem.id ?? 0) - (firstItem.id ?? 0)
  })

export const emptyTransactionMetrics = {
  depositTotalLabel: 'BDT 0.00',
  expenseTotalLabel: 'BDT 0.00',
  incomeTotalLabel: 'BDT 0.00',
  totalCountLabel: '0',
}

export const fetchTransactionsCollection = async () => {
  const payload = await apiRequest(API_URLS.transactions.list)
  const data = unwrapResponseData(payload, 'Unable to load transactions.')
  const items = Array.isArray(data) ? data : []

  return sortTransactions(items.map(normalizeTransaction))
}

export const fetchTransactionDependencies = async () => {
  const [accounts, categories] = await Promise.all([
    fetchAccountsCollection(),
    fetchCategoriesCollection(),
  ])

  return { accounts, categories }
}

export const filterTransactions = (
  items = [],
  {
    accountFilter = 'all',
    categoryFilter = 'all',
    fromDate = '',
    search = '',
    toDate = '',
    typeFilter = 'all',
  } = {},
) => {
  const normalizedSearch = String(search ?? '').trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !normalizedSearch || item.searchText.includes(normalizedSearch)
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesAccount =
      accountFilter === 'all' || String(item.account_id) === String(accountFilter)
    const matchesCategory =
      categoryFilter === 'all' || String(item.category_id) === String(categoryFilter)
    const matchesFromDate = !fromDate || (item.transactionDateKey && item.transactionDateKey >= fromDate)
    const matchesToDate = !toDate || (item.transactionDateKey && item.transactionDateKey <= toDate)

    return (
      matchesSearch &&
      matchesType &&
      matchesAccount &&
      matchesCategory &&
      matchesFromDate &&
      matchesToDate
    )
  })
}

export const paginateTransactions = (items = [], page = 1) => {
  const total = items.length
  const lastPage = Math.max(Math.ceil(total / TRANSACTION_PAGE_SIZE), 1)
  const currentPage = Math.min(Math.max(page, 1), lastPage)
  const from = total ? (currentPage - 1) * TRANSACTION_PAGE_SIZE + 1 : 0
  const to = total ? Math.min(currentPage * TRANSACTION_PAGE_SIZE, total) : 0
  const startIndex = total ? from - 1 : 0
  const rows = items
    .slice(startIndex, startIndex + TRANSACTION_PAGE_SIZE)
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

export const buildTransactionMetrics = (items = []) => {
  const incomeTotal = items
    .filter((item) => item.type === 'INCOME')
    .reduce((sum, item) => sum + item.amountValue, 0)
  const expenseTotal = items
    .filter((item) => item.type === 'EXPENSE' || item.type === 'RECURRING')
    .reduce((sum, item) => sum + item.amountValue, 0)
  const depositTotal = items
    .filter((item) => item.type === 'DEPOSIT')
    .reduce((sum, item) => sum + item.amountValue, 0)

  return {
    depositTotalLabel: `BDT ${currencyFormatter.format(depositTotal)}`,
    expenseTotalLabel: `BDT ${currencyFormatter.format(expenseTotal)}`,
    incomeTotalLabel: `BDT ${currencyFormatter.format(incomeTotal)}`,
    totalCountLabel: countFormatter.format(items.length),
  }
}

export const createTransactionEntry = async (entryType, payload) => {
  const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
  const endpoint = entryEndpointMap[normalizedEntryType]

  if (!endpoint) {
    throw new Error('Invalid transaction type.')
  }

  return assertSuccessfulExecution(
    await apiRequest(endpoint, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to create transaction.',
  )
}

export const updateTransactionEntry = async (transactionId, payload) =>
  assertSuccessfulExecution(
    await updateTransactionRequest(transactionId, payload),
    'Unable to update transaction.',
  )
