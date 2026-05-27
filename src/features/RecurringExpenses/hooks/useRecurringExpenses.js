import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildRecurringExpenseMetrics,
  createRecurringExpense,
  emptyRecurringExpenseMetrics,
  fetchRecurringExpenseDependencies,
  fetchRecurringExpensesCollection,
  filterRecurringExpenses,
  paginateRecurringExpenses,
  runDueRecurringExpenses,
  runRecurringExpense,
  updateRecurringExpense,
} from '../service/recurringExpensesService'

const emptyPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

export default function useRecurringExpenses() {
  const toast = useToast()
  const [accounts, setAccounts] = useState([])
  const [allItems, setAllItems] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [frequencyFilter, setFrequencyFilter] = useState('all')
  const [dueThrough, setDueThrough] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState('')

  const loadRecurringExpenses = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [items, dependencies] = await Promise.all([
        fetchRecurringExpensesCollection(),
        fetchRecurringExpenseDependencies(),
      ])

      setAllItems(items)
      setAccounts(dependencies.accounts)
      setCategories(dependencies.categories)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load recurring expenses.'
      setAccounts([])
      setAllItems([])
      setCategories([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRecurringExpenses()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadRecurringExpenses])

  const filteredItems = useMemo(
    () =>
      filterRecurringExpenses(allItems, {
        accountFilter,
        categoryFilter,
        dueThrough,
        frequencyFilter,
        search,
        statusFilter,
      }),
    [accountFilter, allItems, categoryFilter, dueThrough, frequencyFilter, search, statusFilter],
  )
  const paginatedState = useMemo(
    () => paginateRecurringExpenses(filteredItems, page),
    [filteredItems, page],
  )
  const metrics = useMemo(() => buildRecurringExpenseMetrics(allItems), [allItems])

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  const createItem = async (payload) => {
    setIsMutating(true)

    try {
      await createRecurringExpense(payload)
      toast.success('Recurring expense created successfully.')
      setPage(1)
      await loadRecurringExpenses()
    } finally {
      setIsMutating(false)
    }
  }

  const updateItem = async (id, payload) => {
    setIsMutating(true)

    try {
      await updateRecurringExpense(id, payload)
      toast.success('Recurring expense updated successfully.')
      await loadRecurringExpenses()
    } finally {
      setIsMutating(false)
    }
  }

  const runItem = async (id, payload = {}) => {
    setIsMutating(true)

    try {
      const result = await runRecurringExpense(id, payload)
      toast.success('Recurring expense executed successfully.')
      await loadRecurringExpenses()
      return result
    } finally {
      setIsMutating(false)
    }
  }

  const runDueItems = async (payload = {}) => {
    setIsMutating(true)

    try {
      const result = await runDueRecurringExpenses(payload)

      if ((result?.count ?? 0) > 0) {
        const count = result.count
        toast.success(`${count} due recurring expense${count === 1 ? '' : 's'} executed successfully.`)
      } else {
        toast.info('No due recurring expenses found.')
      }

      await loadRecurringExpenses()
      return result
    } finally {
      setIsMutating(false)
    }
  }

  return {
    accountFilter,
    accounts,
    categories,
    categoryFilter,
    createItem,
    dueThrough,
    error,
    frequencyFilter,
    isLoading,
    isMutating,
    items: paginatedState.rows,
    metrics: allItems.length ? metrics : emptyRecurringExpenseMetrics,
    page,
    pagination: allItems.length ? paginatedState.pagination : emptyPagination,
    refresh: loadRecurringExpenses,
    runDueItems,
    runItem,
    search,
    setAccountFilter,
    setCategoryFilter,
    setDueThrough,
    setFrequencyFilter,
    setPage,
    setSearch,
    setStatusFilter,
    statusFilter,
    updateItem,
  }
}
