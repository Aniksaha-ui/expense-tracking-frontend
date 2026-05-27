import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildAccountMetrics,
  createAccount,
  deleteAccount,
  emptyAccountMetrics,
  fetchAccountById,
  fetchAccountsCollection,
  filterAccounts,
  paginateAccounts,
  updateAccount,
} from '../service/accountsService'

const emptyPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

export default function useAccounts() {
  const toast = useToast()
  const [allItems, setAllItems] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState('')

  const loadAccounts = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const accounts = await fetchAccountsCollection()
      setAllItems(accounts)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load accounts.'
      setAllItems([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAccounts()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadAccounts])

  const filteredItems = useMemo(
    () => filterAccounts(allItems, search, typeFilter),
    [allItems, search, typeFilter],
  )
  const paginatedState = useMemo(
    () => paginateAccounts(filteredItems, page),
    [filteredItems, page],
  )
  const metrics = useMemo(() => buildAccountMetrics(allItems), [allItems])

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  const createItem = async (payload) => {
    setIsMutating(true)

    try {
      await createAccount(payload)
      toast.success('Account created successfully.')
      setPage(1)
      await loadAccounts()
    } finally {
      setIsMutating(false)
    }
  }

  const updateItem = async (id, payload) => {
    setIsMutating(true)

    try {
      await updateAccount(id, payload)
      toast.success('Account updated successfully.')
      await loadAccounts()
    } finally {
      setIsMutating(false)
    }
  }

  return {
    createItem,
    deleteItem: deleteAccount,
    error,
    fetchAccountById,
    isLoading,
    isMutating,
    items: paginatedState.rows,
    metrics: allItems.length ? metrics : emptyAccountMetrics,
    page,
    pagination: allItems.length ? paginatedState.pagination : emptyPagination,
    refresh: loadAccounts,
    search,
    setPage,
    setSearch,
    setTypeFilter,
    typeFilter,
    updateItem,
  }
}
