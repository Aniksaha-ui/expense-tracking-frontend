import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildTransactionMetrics,
  createTransactionEntry,
  emptyTransactionMetrics,
  fetchTransactionDependencies,
  fetchTransactionsCollection,
  filterTransactions,
  paginateTransactions,
} from '../service/transactionsService'

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

export default function useTransactions() {
  const toast = useToast()
  const [accounts, setAccounts] = useState([])
  const [allItems, setAllItems] = useState([])
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState('')

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [transactions, dependencies] = await Promise.all([
        fetchTransactionsCollection(),
        fetchTransactionDependencies(),
      ])

      setAllItems(transactions)
      setAccounts(dependencies.accounts)
      setCategories(dependencies.categories)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load transactions.'
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
      void loadTransactions()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadTransactions])

  const filteredItems = useMemo(
    () =>
      filterTransactions(allItems, {
        accountFilter,
        categoryFilter,
        fromDate,
        search,
        toDate,
        typeFilter,
      }),
    [accountFilter, allItems, categoryFilter, fromDate, search, toDate, typeFilter],
  )
  const paginatedState = useMemo(
    () => paginateTransactions(filteredItems, page),
    [filteredItems, page],
  )
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
      await loadTransactions()
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
  }
}
