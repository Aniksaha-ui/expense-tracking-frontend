import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildTransferMetrics,
  createTransferEntry,
  emptyTransferMetrics,
  fetchTransferDependencies,
  fetchTransfersCollection,
  filterTransfers,
  paginateTransfers,
  updateTransferEntry,
} from '../service/transfersService'

const emptyPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

const successMessages = {
  TRANSFER: 'Transfer completed successfully.',
  WITHDRAWAL: 'Withdrawal completed successfully.',
}

const updateSuccessMessages = {
  TRANSFER: 'Transfer updated successfully.',
  WITHDRAWAL: 'Withdrawal updated successfully.',
}

export default function useTransfers() {
  const toast = useToast()
  const [accounts, setAccounts] = useState([])
  const [allItems, setAllItems] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [flowFilter, setFlowFilter] = useState('all')
  const [accountFilter, setAccountFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState('')

  const loadTransfers = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const [transfers, dependencies] = await Promise.all([
        fetchTransfersCollection(),
        fetchTransferDependencies(),
      ])

      setAllItems(transfers)
      setAccounts(dependencies.accounts)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load transfers.'
      setAccounts([])
      setAllItems([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransfers()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadTransfers])

  const filteredItems = useMemo(
    () =>
      filterTransfers(allItems, {
        accountFilter,
        flowFilter,
        fromDate,
        search,
        toDate,
      }),
    [accountFilter, allItems, flowFilter, fromDate, search, toDate],
  )
  const paginatedState = useMemo(() => paginateTransfers(filteredItems, page), [filteredItems, page])
  const metrics = useMemo(() => buildTransferMetrics(allItems), [allItems])

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  const createItem = async (entryType, payload) => {
    const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
    setIsMutating(true)

    try {
      await createTransferEntry(normalizedEntryType, payload)
      toast.success(successMessages[normalizedEntryType] || 'Transfer created successfully.')
      setPage(1)
      await loadTransfers()
    } finally {
      setIsMutating(false)
    }
  }

  const updateItem = async (id, entryType, payload) => {
    const normalizedEntryType = String(entryType ?? '').trim().toUpperCase()
    setIsMutating(true)

    try {
      await updateTransferEntry(id, payload)
      toast.success(updateSuccessMessages[normalizedEntryType] || 'Transfer updated successfully.')
      await loadTransfers()
    } finally {
      setIsMutating(false)
    }
  }

  return {
    accountFilter,
    accounts,
    createItem,
    error,
    flowFilter,
    fromDate,
    isLoading,
    isMutating,
    items: paginatedState.rows,
    metrics: allItems.length ? metrics : emptyTransferMetrics,
    page,
    pagination: allItems.length ? paginatedState.pagination : emptyPagination,
    refresh: loadTransfers,
    search,
    setAccountFilter,
    setFlowFilter,
    setFromDate,
    setPage,
    setSearch,
    setToDate,
    toDate,
    updateItem,
  }
}
