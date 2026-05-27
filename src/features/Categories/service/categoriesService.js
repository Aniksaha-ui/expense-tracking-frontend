import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { assertSuccessfulExecution, unwrapResponseData } from '../../../services/resourceApi'

const CATEGORY_PAGE_SIZE = 10

const countFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const typeOrder = {
  EXPENSE: 0,
  INCOME: 1,
}

const formatDateLabel = (value) => {
  if (!value) {
    return 'Not available'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return dateFormatter.format(date)
}

const normalizeCategory = (item = {}) => {
  const normalizedType = String(item.type ?? 'EXPENSE')
    .trim()
    .toUpperCase()
  const isDefault = Boolean(item.is_default)

  return {
    createdAtLabel: formatDateLabel(item.created_at),
    id: item.id,
    is_default: isDefault,
    name: item.name ?? 'Untitled category',
    searchText: [
      item.id,
      item.name,
      item.slug,
      normalizedType,
      isDefault ? 'default' : 'custom',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
    slug: item.slug ?? '-',
    sourceKey: isDefault ? 'default' : 'custom',
    sourceLabel: isDefault ? 'Default' : 'Custom',
    sourceToneClassName: isDefault
      ? 'border-blue-500/20 bg-blue-500/10 text-blue-100'
      : 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    type: normalizedType,
    typeLabel: normalizedType === 'INCOME' ? 'Income' : 'Expense',
    typeToneClassName:
      normalizedType === 'INCOME'
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
        : 'border-rose-500/20 bg-rose-500/10 text-rose-100',
    updated_at: item.updated_at,
    updatedAtLabel: formatDateLabel(item.updated_at ?? item.created_at),
  }
}

const sortCategories = (items = []) =>
  [...items].sort((firstItem, secondItem) => {
    const typeDifference =
      (typeOrder[firstItem.type] ?? Number.MAX_SAFE_INTEGER) -
      (typeOrder[secondItem.type] ?? Number.MAX_SAFE_INTEGER)

    if (typeDifference !== 0) {
      return typeDifference
    }

    if (firstItem.is_default !== secondItem.is_default) {
      return firstItem.is_default ? -1 : 1
    }

    return firstItem.name.localeCompare(secondItem.name)
  })

export const emptyCategoryMetrics = {
  customCountLabel: '0',
  expenseCountLabel: '0',
  incomeCountLabel: '0',
  totalCountLabel: '0',
}

export const fetchCategoriesCollection = async () => {
  const payload = await apiRequest(API_URLS.categories.list)
  const data = unwrapResponseData(payload, 'Unable to load categories.')
  const items = Array.isArray(data) ? data : []

  return sortCategories(items.map(normalizeCategory))
}

export const filterCategories = (items = [], search = '', typeFilter = 'all') => {
  const normalizedSearch = String(search ?? '').trim().toLowerCase()

  return items.filter((item) => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesSearch = !normalizedSearch || item.searchText.includes(normalizedSearch)

    return matchesType && matchesSearch
  })
}

export const paginateCategories = (items = [], page = 1) => {
  const total = items.length
  const lastPage = Math.max(Math.ceil(total / CATEGORY_PAGE_SIZE), 1)
  const currentPage = Math.min(Math.max(page, 1), lastPage)
  const from = total ? (currentPage - 1) * CATEGORY_PAGE_SIZE + 1 : 0
  const to = total ? Math.min(currentPage * CATEGORY_PAGE_SIZE, total) : 0
  const startIndex = total ? from - 1 : 0
  const rows = items
    .slice(startIndex, startIndex + CATEGORY_PAGE_SIZE)
    .map((item, index) => ({
      ...item,
      serial: from + index,
    }))

  return {
    pagination: {
      currentPage,
      from,
      lastPage,
      to,
      total,
    },
    rows,
  }
}

export const buildCategoryMetrics = (items = []) => {
  const expenseCount = items.filter((item) => item.type === 'EXPENSE').length
  const incomeCount = items.filter((item) => item.type === 'INCOME').length
  const customCount = items.filter((item) => !item.is_default).length

  return {
    customCountLabel: countFormatter.format(customCount),
    expenseCountLabel: countFormatter.format(expenseCount),
    incomeCountLabel: countFormatter.format(incomeCount),
    totalCountLabel: countFormatter.format(items.length),
  }
}

export const createCategory = async (payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.categories.list, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to create category.',
  )

export const updateCategory = async (categoryId, payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.categories.update(categoryId), {
      body: JSON.stringify(payload),
      method: 'PUT',
    }),
    'Unable to update category.',
  )

export const deleteCategory = async () => {
  throw new Error('Category delete is not available in the API yet.')
}
