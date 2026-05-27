export const recurringExpenseFieldRules = {
  account_id: {
    required: 'Account is required.',
  },
  amount: {
    pattern: {
      message: 'Amount must be a valid number with up to 2 decimal places.',
      value: /^\d+(\.\d{1,2})?$/,
    },
    required: 'Amount is required.',
  },
  category_id: {
    required: 'Expense category is required.',
  },
  frequency: {
    required: 'Frequency is required.',
  },
  is_active: {
    required: 'Status is required.',
  },
  note: {
    maxLength: {
      message: 'Note must be 1000 characters or less.',
      value: 1000,
    },
  },
  start_date: {
    required: 'Start date is required.',
  },
  title: {
    maxLength: {
      message: 'Title must be 255 characters or less.',
      value: 255,
    },
    required: 'Title is required.',
  },
}

export const validateRecurringDateAfterStart = (value, startDate, label) => {
  const normalizedValue = String(value ?? '').trim()
  const normalizedStartDate = String(startDate ?? '').trim()

  if (!normalizedValue || !normalizedStartDate) {
    return true
  }

  return normalizedValue >= normalizedStartDate || `${label} must be on or after the start date.`
}
