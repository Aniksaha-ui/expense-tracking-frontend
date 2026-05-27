export const transactionFieldRules = {
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
  note: {
    maxLength: {
      message: 'Note must be 1000 characters or less.',
      value: 1000,
    },
  },
}

export const validateTransactionCategory = (value, entryType, categories = []) => {
  const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
  const hasValue = String(value ?? '').trim() !== ''

  if (normalizedEntryType === 'DEPOSIT') {
    return true
  }

  if (normalizedEntryType === 'EXPENSE' && !hasValue) {
    return 'Category is required for expense transactions.'
  }

  if (!hasValue) {
    return true
  }

  return (
    categories.some((category) => String(category.id) === String(value)) ||
    'Selected category is not available for this transaction type.'
  )
}
