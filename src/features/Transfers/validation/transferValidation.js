export const transferFieldRules = {
  amount: {
    pattern: {
      message: 'Amount must be a valid number with up to 2 decimal places.',
      value: /^\d+(\.\d{1,2})?$/,
    },
    required: 'Amount is required.',
  },
  from_account_id: {
    required: 'Source account is required.',
  },
  note: {
    maxLength: {
      message: 'Note must be 1000 characters or less.',
      value: 1000,
    },
  },
  to_account_id: {
    required: 'Destination account is required.',
  },
}

export const validateTransferAccountPair = (fromAccountId, toAccountId) => {
  if (!String(fromAccountId ?? '').trim() || !String(toAccountId ?? '').trim()) {
    return true
  }

  return (
    String(fromAccountId) !== String(toAccountId) ||
    'Source and destination accounts must be different.'
  )
}
