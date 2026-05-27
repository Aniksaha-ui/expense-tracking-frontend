import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { assertSuccessfulExecution, unwrapResponseData } from '../../../services/resourceApi'

const ACCOUNT_PAGE_SIZE = 10

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

const typeOrder = {
  CASH: 0,
  BANK: 1,
  CARD: 2,
  MOBILE_BANKING: 3,
}

const accountTypeLabels = {
  BANK: 'Bank',
  CARD: 'Card',
  CASH: 'Cash',
  MOBILE_BANKING: 'Mobile Banking',
}

const accountTypeToneClassNames = {
  BANK: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
  CARD: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
  CASH: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
  MOBILE_BANKING: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100',
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

const toNumber = (value) => Number(value) || 0
const toBoolean = (value) => value === true || value === 1 || value === '1'

const normalizeAccount = (item = {}) => {
  const normalizedType = String(item.type ?? 'BANK')
    .trim()
    .toUpperCase()
  const isActive = toBoolean(item.is_active)
  const institutionName = String(item.institution_name ?? '').trim()
  const currentBalance = toNumber(item.current_balance)

  return {
    current_balance: item.current_balance ?? '0.00',
    currentBalanceAmount: currentBalance,
    currentBalanceLabel: `BDT ${currencyFormatter.format(currentBalance)}`,
    id: item.id,
    institution_name: institutionName,
    institutionLabel:
      institutionName || (normalizedType === 'CASH' ? 'Cash wallet' : 'No institution provided'),
    is_active: isActive,
    name: item.name ?? 'Untitled account',
    searchText: [
      item.id,
      item.name,
      institutionName,
      normalizedType,
      isActive ? 'active' : 'inactive',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    statusLabel: isActive ? 'Active' : 'Inactive',
    statusToneClassName: isActive
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
      : 'border-slate-500/20 bg-slate-500/10 text-slate-200',
    type: normalizedType,
    typeLabel: accountTypeLabels[normalizedType] ?? normalizedType,
    typeToneClassName:
      accountTypeToneClassNames[normalizedType] ?? 'border-blue-500/20 bg-blue-500/10 text-blue-100',
    updated_at: item.updated_at,
    updatedAtLabel: formatDateLabel(item.updated_at ?? item.created_at),
  }
}

const sortAccounts = (items = []) =>
  [...items].sort((firstItem, secondItem) => {
    const typeDifference =
      (typeOrder[firstItem.type] ?? Number.MAX_SAFE_INTEGER) -
      (typeOrder[secondItem.type] ?? Number.MAX_SAFE_INTEGER)

    if (typeDifference !== 0) {
      return typeDifference
    }

    if (firstItem.is_active !== secondItem.is_active) {
      return firstItem.is_active ? -1 : 1
    }

    return firstItem.name.localeCompare(secondItem.name)
  })

export const emptyAccountMetrics = {
  activeCountLabel: '0',
  cashCountLabel: '0',
  totalBalanceLabel: 'BDT 0.00',
  totalCountLabel: '0',
}

export const buildAccountFormState = (item = {}) => ({
  id: item.id,
  institution_name: item.institution_name ?? '',
  is_active: toBoolean(item.is_active) ? '1' : '0',
  name: item.name ?? '',
  type: String(item.type ?? 'BANK')
    .trim()
    .toUpperCase(),
})

export const fetchAccountsCollection = async () => {
  const payload = await apiRequest(API_URLS.accounts.list)
  const data = unwrapResponseData(payload, 'Unable to load accounts.')
  const items = Array.isArray(data) ? data : []

  return sortAccounts(items.map(normalizeAccount))
}

export const fetchAccountById = async (accountId) => {
  const payload = await apiRequest(API_URLS.accounts.byId(accountId))
  const data = unwrapResponseData(payload, 'Unable to load account details.')

  return buildAccountFormState(data ?? {})
}

export const filterAccounts = (items = [], search = '', typeFilter = 'all') => {
  const normalizedSearch = String(search ?? '').trim().toLowerCase()

  return items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesSearch = !normalizedSearch || item.searchText.includes(normalizedSearch)

    return matchesType && matchesSearch
  })
}

export const paginateAccounts = (items = [], page = 1) => {
  const total = items.length
  const lastPage = Math.max(Math.ceil(total / ACCOUNT_PAGE_SIZE), 1)
  const currentPage = Math.min(Math.max(page, 1), lastPage)
  const from = total ? (currentPage - 1) * ACCOUNT_PAGE_SIZE + 1 : 0
  const to = total ? Math.min(currentPage * ACCOUNT_PAGE_SIZE, total) : 0
  const startIndex = total ? from - 1 : 0
  const rows = items
    .slice(startIndex, startIndex + ACCOUNT_PAGE_SIZE)
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

export const buildAccountMetrics = (items = []) => {
  const activeCount = items.filter((item) => item.is_active).length
  const cashCount = items.filter((item) => item.type === 'CASH').length
  const totalBalance = items.reduce((sum, item) => sum + item.currentBalanceAmount, 0)

  return {
    activeCountLabel: countFormatter.format(activeCount),
    cashCountLabel: countFormatter.format(cashCount),
    totalBalanceLabel: `BDT ${currencyFormatter.format(totalBalance)}`,
    totalCountLabel: countFormatter.format(items.length),
  }
}

export const createAccount = async (payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.accounts.list, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to create account.',
  )

export const updateAccount = async (accountId, payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.accounts.update(accountId), {
      body: JSON.stringify(payload),
      method: 'PUT',
    }),
    'Unable to update account.',
  )

export const deleteAccount = async () => {
  throw new Error('Account delete is not available in the API yet.')
}
