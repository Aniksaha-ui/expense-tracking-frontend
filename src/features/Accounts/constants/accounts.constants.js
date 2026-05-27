import { accountFieldRules } from '../validation/accountValidation'

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE_BANKING', label: 'Mobile Banking' },
]

export const ACCOUNT_STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' },
]

export const ACCOUNT_FILTER_TABS = [
  { key: 'all', label: 'All Accounts' },
  { key: 'CASH', label: 'Cash' },
  { key: 'BANK', label: 'Bank' },
  { key: 'CARD', label: 'Card' },
  { key: 'MOBILE_BANKING', label: 'Mobile Banking' },
]

export const ACCOUNTS_PAGE_COPY = {
  title: 'Account Management',
  subtitle:
    'Create and update wallets, bank accounts, cards, and mobile banking balances used throughout the expense tracker.',
  searchPlaceholder: 'Search by name, institution, type, status, or account ID',
  newButtonLabel: 'New Account',
}

export const accountFields = [
  {
    name: 'name',
    label: 'Account Name',
    placeholder: 'Main Bank',
    rules: accountFieldRules.name,
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    defaultValue: 'BANK',
    options: ACCOUNT_TYPE_OPTIONS,
    rules: accountFieldRules.type,
  },
  {
    name: 'institution_name',
    label: 'Institution Name',
    placeholder: 'DBBL / Visa / bKash',
    rules: accountFieldRules.institution_name,
  },
  {
    createOnly: true,
    name: 'opening_balance',
    label: 'Opening Balance',
    min: '0',
    placeholder: '0.00',
    step: '0.01',
    type: 'number',
    rules: accountFieldRules.opening_balance,
  },
  {
    createOnly: true,
    name: 'opening_balance_date',
    label: 'Opening Balance Date',
    type: 'date',
  },
  {
    name: 'is_active',
    label: 'Status',
    type: 'select',
    defaultValue: '1',
    options: ACCOUNT_STATUS_OPTIONS,
    rules: accountFieldRules.is_active,
  },
]

export const toAccountPayload = (values, editingItem) => {
  const payload = {
    name: String(values.name ?? '').trim(),
    type: String(values.type ?? 'BANK')
      .trim()
      .toUpperCase(),
    institution_name: String(values.institution_name ?? '').trim() || null,
    is_active: values.is_active === '1' || values.is_active === true,
  }

  if (!editingItem) {
    const openingBalance = String(values.opening_balance ?? '').trim()
    const openingBalanceDate = String(values.opening_balance_date ?? '').trim()

    if (openingBalance) {
      payload.opening_balance = openingBalance
    }

    if (openingBalanceDate) {
      payload.opening_balance_date = openingBalanceDate
    }
  }

  return payload
}
