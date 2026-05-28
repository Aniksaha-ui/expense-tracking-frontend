import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { assertSuccessfulExecution, unwrapResponseData } from '../../../services/resourceApi'
import { fetchAccountsCollection } from '../../Accounts/service/accountsService'
import { isWithdrawalEntry } from '../constants/transfers.constants'

const TRANSFER_PAGE_SIZE = 10

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

const transferUpdateCandidates = (transferId) => [
  { endpoint: API_URLS.transfers.update(transferId), method: 'PUT' },
  { endpoint: API_URLS.transfers.update(transferId), method: 'PATCH' },
  { endpoint: `/transfers/update/${transferId}`, method: 'PUT' },
  { endpoint: `/transfers/update/${transferId}`, method: 'PATCH' },
  { endpoint: `/transfers/update/${transferId}`, method: 'POST' },
]

const isRetryableUpdateError = (error) => {
  const message = String(error?.message ?? '').trim().toLowerCase()

  return (
    message.includes('could not be found') ||
    message.includes('not supported for route') ||
    message.includes('supported methods')
  )
}

const updateTransferRequest = async (transferId, payload) => {
  let lastError = null

  for (const candidate of transferUpdateCandidates(transferId)) {
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

  throw lastError ?? new Error('Unable to update transfer.')
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

const toTitleLabel = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const toNumber = (value) => Number(value) || 0

const normalizeTransfer = (item = {}) => {
  const fromAccount = item.from_account ?? {}
  const toAccount = item.to_account ?? {}
  const isWithdrawal = Boolean(item.is_withdrawal)
  const amountValue = toNumber(item.amount)

  return {
    amount: item.amount ?? '0.00',
    amountLabel: `BDT ${currencyFormatter.format(amountValue)}`,
    amountValue,
    flowKey: isWithdrawal ? 'withdrawal' : 'transfer',
    flowLabel: isWithdrawal ? 'Withdraw To Cash' : 'Transfer',
    flowToneClassName: isWithdrawal
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-100'
      : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100',
    fromAccountId: fromAccount.id ?? null,
    fromAccountLabel: fromAccount.name ?? 'Unknown source',
    fromAccountTypeLabel: toTitleLabel(fromAccount.type ?? 'Unknown'),
    id: item.id,
    is_withdrawal: isWithdrawal,
    note: String(item.note ?? '').trim(),
    noteLabel: String(item.note ?? '').trim() || 'No note added',
    searchText: [
      item.id,
      isWithdrawal ? 'withdrawal' : 'transfer',
      fromAccount.name,
      fromAccount.type,
      toAccount.name,
      toAccount.type,
      item.note,
      item.transfer_date,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    toAccountId: toAccount.id ?? null,
    toAccountLabel: toAccount.name ?? 'Unknown destination',
    toAccountTypeLabel: toTitleLabel(toAccount.type ?? 'Unknown'),
    transfer_date: item.transfer_date,
    transferDateKey: toDateKey(item.transfer_date),
    transferDateLabel: formatDateLabel(item.transfer_date),
  }
}

const sortTransfers = (items = []) =>
  [...items].sort((firstItem, secondItem) => {
    if (firstItem.transferDateKey !== secondItem.transferDateKey) {
      return secondItem.transferDateKey.localeCompare(firstItem.transferDateKey)
    }

    return (secondItem.id ?? 0) - (firstItem.id ?? 0)
  })

export const emptyTransferMetrics = {
  totalAmountLabel: 'BDT 0.00',
  totalCountLabel: '0',
  transferCountLabel: '0',
  withdrawalCountLabel: '0',
}

export const fetchTransfersCollection = async () => {
  const payload = await apiRequest(API_URLS.transfers.list)
  const data = unwrapResponseData(payload, 'Unable to load transfers.')
  const items = Array.isArray(data) ? data : []

  return sortTransfers(items.map(normalizeTransfer))
}

export const fetchTransferDependencies = async () => ({
  accounts: await fetchAccountsCollection(),
})

export const filterTransfers = (
  items = [],
  { accountFilter = 'all', flowFilter = 'all', fromDate = '', search = '', toDate = '' } = {},
) => {
  const normalizedSearch = String(search ?? '').trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !normalizedSearch || item.searchText.includes(normalizedSearch)
    const matchesFlow = flowFilter === 'all' || item.flowKey === flowFilter
    const matchesAccount =
      accountFilter === 'all' ||
      String(item.fromAccountId) === String(accountFilter) ||
      String(item.toAccountId) === String(accountFilter)
    const matchesFromDate = !fromDate || (item.transferDateKey && item.transferDateKey >= fromDate)
    const matchesToDate = !toDate || (item.transferDateKey && item.transferDateKey <= toDate)

    return matchesSearch && matchesFlow && matchesAccount && matchesFromDate && matchesToDate
  })
}

export const paginateTransfers = (items = [], page = 1) => {
  const total = items.length
  const lastPage = Math.max(Math.ceil(total / TRANSFER_PAGE_SIZE), 1)
  const currentPage = Math.min(Math.max(page, 1), lastPage)
  const from = total ? (currentPage - 1) * TRANSFER_PAGE_SIZE + 1 : 0
  const to = total ? Math.min(currentPage * TRANSFER_PAGE_SIZE, total) : 0
  const startIndex = total ? from - 1 : 0
  const rows = items
    .slice(startIndex, startIndex + TRANSFER_PAGE_SIZE)
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

export const buildTransferMetrics = (items = []) => {
  const withdrawalCount = items.filter((item) => item.is_withdrawal).length
  const totalAmount = items.reduce((sum, item) => sum + item.amountValue, 0)

  return {
    totalAmountLabel: `BDT ${currencyFormatter.format(totalAmount)}`,
    totalCountLabel: countFormatter.format(items.length),
    transferCountLabel: countFormatter.format(items.length - withdrawalCount),
    withdrawalCountLabel: countFormatter.format(withdrawalCount),
  }
}

export const createTransferEntry = async (entryType, payload) => {
  const endpoint = isWithdrawalEntry(entryType)
    ? API_URLS.transfers.withdrawToCash
    : API_URLS.transfers.create

  return assertSuccessfulExecution(
    await apiRequest(endpoint, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to create transfer.',
  )
}

export const updateTransferEntry = async (transferId, payload) =>
  assertSuccessfulExecution(
    await updateTransferRequest(transferId, payload),
    'Unable to update transfer.',
  )
