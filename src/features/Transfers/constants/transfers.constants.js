export const TRANSFER_ENTRY_OPTIONS = [
  {
    description: 'Move balance between any two different accounts.',
    label: 'Standard Transfer',
    value: 'TRANSFER',
  },
  {
    description: 'Move balance from a non-cash account into a cash account.',
    label: 'Withdraw To Cash',
    value: 'WITHDRAWAL',
  },
]

export const TRANSFER_FILTER_TABS = [
  { key: 'all', label: 'All Transfers' },
  { key: 'transfer', label: 'Standard Transfers' },
  { key: 'withdrawal', label: 'Cash Withdrawals' },
]

export const TRANSFERS_PAGE_COPY = {
  title: 'Transfer Management',
  subtitle:
    'Move money between accounts and record withdrawals to cash while keeping balances synchronized.',
  searchPlaceholder: 'Search by note, source, destination, date, transfer type, or transfer ID',
}

export const isWithdrawalEntry = (entryType) =>
  String(entryType ?? '').trim().toUpperCase() === 'WITHDRAWAL'

export const buildTransferPayload = (values) => {
  const note = String(values.note ?? '').trim()
  const transferDate = String(values.transfer_date ?? '').trim()
  const payload = {
    amount: String(values.amount ?? '').trim(),
    from_account_id: Number(values.from_account_id),
    to_account_id: Number(values.to_account_id),
    note: note || null,
  }

  if (transferDate) {
    payload.transfer_date = transferDate
  }

  return payload
}
