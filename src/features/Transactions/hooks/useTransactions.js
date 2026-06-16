import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildTransactionMetrics,
  createTransactionEntry,
  emptyTransactionMetrics,
  fetchTransactionDependencies,
  fetchTransactionsCollection,
  paginateTransactions,
  updateTransactionEntry,
} from '../service/transactionsService'

const toDateInputValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const createDefaultDateRange = () => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    fromDate: toDateInputValue(firstDayOfMonth),
    toDate: toDateInputValue(today),
  }
}

const emptyPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

const successMessages = {
  DEPOSIT: 'Deposit transaction created successfully.',
  EXPENSE: 'Expense transaction created successfully.',
  INCOME: 'Income transaction created successfully.',
}

const updateSuccessMessages = {
  DEPOSIT: 'Deposit transaction updated successfully.',
  EXPENSE: 'Expense transaction updated successfully.',
  INCOME: 'Income transaction updated successfully.',
}

export default function useTransactions() {
  const defaultDateRange = useMemo(() => createDefaultDateRange(), [])
  const toast = useToast()
  const [accounts, setAccounts] = useState([])
  const [allItems, setAllItems] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate)
  const [toDate, setToDate] = useState(defaultDateRange.toDate)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState('')

  const loadDependencies = useCallback(async () => {
    try {
      const dependencies = await fetchTransactionDependencies()

      setAccounts(dependencies.accounts)
      setCategories(dependencies.categories)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load transaction dependencies.'

      setAccounts([])
      setCategories([])
      toast.error(message)
    }
  }, [toast])

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const transactions = await fetchTransactionsCollection({
        accountFilter,
        categoryFilter,
        fromDate,
        search,
        toDate,
        typeFilter,
      })

      setAllItems(transactions)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load transactions.'

      setAllItems([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [accountFilter, categoryFilter, fromDate, search, toDate, toast, typeFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDependencies()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadDependencies])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransactions()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadTransactions])

  const paginatedState = useMemo(() => paginateTransactions(allItems, page), [allItems, page])
  const metrics = useMemo(() => buildTransactionMetrics(allItems), [allItems])

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  const createItem = async (entryType, payload) => {
    const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
    setIsMutating(true)

    try {
      await createTransactionEntry(normalizedEntryType, payload)
      toast.success(successMessages[normalizedEntryType] || 'Transaction created successfully.')
      setPage(1)
      await Promise.all([loadTransactions(), loadDependencies()])
    } finally {
      setIsMutating(false)
    }
  }

  const updateItem = async (id, entryType, payload) => {
    const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
    setIsMutating(true)

    try {
      await updateTransactionEntry(id, payload)
      toast.success(
        updateSuccessMessages[normalizedEntryType] || 'Transaction updated successfully.',
      )
      await Promise.all([loadTransactions(), loadDependencies()])
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
    defaultDateRange,
    error,
    fromDate,
    isLoading,
    isMutating,
    items: paginatedState.rows,
    metrics: allItems.length ? metrics : emptyTransactionMetrics,
    page,
    pagination: allItems.length ? paginatedState.pagination : emptyPagination,
    refresh: loadTransactions,
    search,
    setAccountFilter,
    setCategoryFilter,
    setFromDate,
    setPage,
    setSearch,
    setToDate,
    setTypeFilter,
    toDate,
    typeFilter,
    updateItem,
  }
}
