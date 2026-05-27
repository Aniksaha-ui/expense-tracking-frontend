import { categoryFieldRules } from '../validation/categoryValidation'

export const CATEGORY_TYPE_OPTIONS = [
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INCOME', label: 'Income' },
]

export const CATEGORY_FILTER_TABS = [
  { key: 'all', label: 'All Categories' },
  { key: 'EXPENSE', label: 'Expense' },
  { key: 'INCOME', label: 'Income' },
]

export const CATEGORIES_PAGE_COPY = {
  title: 'Category Management',
  subtitle:
    'Create and update the income and expense categories used across transactions, reports, and recurring expenses.',
  searchPlaceholder: 'Search by name, slug, type, source, or category ID',
  newButtonLabel: 'New Category',
}

export const categoryFields = [
  {
    name: 'name',
    label: 'Category Name',
    placeholder: 'Groceries',
    rules: categoryFieldRules.name,
  },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    defaultValue: 'EXPENSE',
    options: CATEGORY_TYPE_OPTIONS,
    rules: categoryFieldRules.type,
  },
]

export const toCategoryPayload = (values) => ({
  name: String(values.name ?? '').trim(),
  type: String(values.type ?? 'EXPENSE')
    .trim()
    .toUpperCase(),
})
