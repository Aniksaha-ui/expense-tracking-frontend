export const accountFieldRules = {
  institution_name: {
    maxLength: {
      message: 'Institution name must be 255 characters or less.',
      value: 255,
    },
  },
  is_active: {
    required: 'Status is required.',
  },
  name: {
    maxLength: {
      message: 'Account name must be 255 characters or less.',
      value: 255,
    },
    required: 'Account name is required.',
  },
  opening_balance: {
    pattern: {
      message: 'Opening balance must be a valid amount with up to 2 decimals.',
      value: /^\d+(\.\d{1,2})?$/,
    },
  },
  type: {
    required: 'Account type is required.',
  },
}
