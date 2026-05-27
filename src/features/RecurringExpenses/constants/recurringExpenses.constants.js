const toDateInput = (value) => {
  if (!value) {
    return ''
  }

  return String(value).trim().slice(0, 10)
}

export const RECURRING_FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
]

export const RECURRING_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const RECURRING_STATUS_TABS = [
  { key: 'all', label: 'All Plans' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

export const RECURRING_PAGE_COPY = {
  title: 'Recurring Expense Management',
  subtitle:
    'Schedule repeated expense transactions, update their cadence, and execute due items without leaving the dashboard.',
  searchPlaceholder: 'Search by title, note, account, category, frequency, or recurring ID',
}

export const buildRecurringExpenseFormState = (item = {}) => ({
  account_id: String(item.account_id ?? item.account?.id ?? ''),
  amount: String(item.amount ?? ''),
  category_id: String(item.category_id ?? item.category?.id ?? ''),
  end_date: toDateInput(item.end_date),
  frequency: String(item.frequency ?? 'MONTHLY')
    .trim()
    .toUpperCase(),
  is_active: item.is_active === false ? '0' : '1',
  next_run_date: toDateInput(item.next_run_date ?? item.start_date),
  note: item.note ?? '',
  start_date: toDateInput(item.start_date),
  title: item.title ?? '',
})

export const buildRecurringExpensePayload = (values) => {
  const startDate = String(values.start_date ?? '').trim()
  const nextRunDate = String(values.next_run_date ?? '').trim()
  const endDate = String(values.end_date ?? '').trim()
  const note = String(values.note ?? '').trim()

  return {
    account_id: Number(values.account_id),
    amount: String(values.amount ?? '').trim(),
    category_id: Number(values.category_id),
    end_date: endDate || null,
    frequency: String(values.frequency ?? 'MONTHLY')
      .trim()
      .toUpperCase(),
    is_active: values.is_active === '1' || values.is_active === true,
    next_run_date: nextRunDate || startDate,
    note: note || null,
    start_date: startDate,
    title: String(values.title ?? '').trim(),
  }
}
