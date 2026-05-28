export const TRANSACTION_ENTRY_OPTIONS = [
  {
    description: 'Record money spent from an account using an expense category.',
    label: 'Expense',
    value: 'EXPENSE',
  },
  {
    description: 'Record incoming money, salary, or any other credit with an optional category.',
    label: 'Income',
    value: 'INCOME',
  },
  {
    description: 'Add money directly into an account without using a category.',
    label: 'Deposit',
    value: 'DEPOSIT',
  },
]

export const TRANSACTION_TYPE_TABS = [
  { key: 'all', label: 'All Transactions' },
  { key: 'EXPENSE', label: 'Expense' },
  { key: 'INCOME', label: 'Income' },
  { key: 'DEPOSIT', label: 'Deposit' },
  { key: 'RECURRING', label: 'Recurring' },
  { key: 'TRANSFER', label: 'Transfer' },
  { key: 'OPENING_BALANCE', label: 'Opening Balance' },
  { key: 'WITHDRAW', label: 'Withdraw' },
]

export const TRANSACTIONS_PAGE_COPY = {
  title: 'Transaction Management',
  subtitle:
    'Track income, expenses, and deposits while keeping account balances in sync with the expense tracker API.',
  searchPlaceholder: 'Search by note, type, account, category, reference, or transaction ID',
}

export const shouldShowTransactionCategory = (entryType) =>
  String(entryType ?? '').trim().toUpperCase() !== 'DEPOSIT'

export const isTransactionCategoryRequired = (entryType) =>
  String(entryType ?? '').trim().toUpperCase() === 'EXPENSE'

const editableTransactionTypes = new Set(['DEPOSIT', 'EXPENSE', 'INCOME'])

const toDateInputValue = (value) => {
  const rawValue = String(value ?? '').trim()

  if (!rawValue) {
    return ''
  }

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

export const isEditableTransactionType = (entryType) =>
  editableTransactionTypes.has(String(entryType ?? '').trim().toUpperCase())

export const buildTransactionFormState = (item = {}) => ({
  account_id: String(item.account_id ?? ''),
  amount: String(item.amount ?? ''),
  category_id: String(item.category_id ?? ''),
  entry_type: String(item.type ?? 'EXPENSE').trim().toUpperCase(),
  note: item.note ?? '',
  transaction_date: toDateInputValue(item.transaction_date),
})

export const buildTransactionPayload = (values, entryType) => {
  const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
  const note = String(values.note ?? '').trim()
  const transactionDate = String(values.transaction_date ?? '').trim()
  const categoryId = String(values.category_id ?? '').trim()
  const payload = {
    account_id: Number(values.account_id),
    amount: String(values.amount ?? '').trim(),
    note: note || null,
  }

  if (transactionDate) {
    payload.transaction_date = transactionDate
  }

  if (normalizedEntryType === 'EXPENSE') {
    payload.category_id = Number(categoryId)
  } else if (normalizedEntryType === 'INCOME' && categoryId) {
    payload.category_id = Number(categoryId)
  }

  return payload
}
