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
