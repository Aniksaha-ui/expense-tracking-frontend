import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildAccountBalanceMetrics,
  buildCategoryBreakdownMetrics,
  emptyAccountBalanceMetrics,
  emptyCategoryBreakdownMetrics,
  emptySummaryReport,
  fetchAccountBalancesReport,
  fetchCategoryBreakdownReport,
  fetchSummaryReport,
  filterAccountBalanceRows,
  filterCategoryBreakdownRows,
  paginateReportRows,
  reportEmptyPagination,
} from '../service/reportsService'

const loadWithDelay = (callback) => {
  const timeoutId = window.setTimeout(() => {
    void callback()
  }, 0)

  return () => window.clearTimeout(timeoutId)
}

export function useSummaryReport() {
  const toast = useToast()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [report, setReport] = useState(emptySummaryReport)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      setReport(await fetchSummaryReport({ fromDate, toDate }))
    } catch (loadError) {
      const message = loadError.message || 'Unable to load summary report.'
      setReport(emptySummaryReport)
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate, toast])

  useEffect(() => loadWithDelay(loadReport), [loadReport])

  return {
    error,
    fromDate,
    isLoading,
    refresh: loadReport,
    report,
    setFromDate,
    setToDate,
    toDate,
  }
}

export function useAccountBalancesReport() {
  const toast = useToast()
  const [allItems, setAllItems] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      setAllItems(await fetchAccountBalancesReport())
    } catch (loadError) {
      const message = loadError.message || 'Unable to load account balances report.'
      setAllItems([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => loadWithDelay(loadReport), [loadReport])

  const filteredItems = useMemo(
    () => filterAccountBalanceRows(allItems, { search, typeFilter }),
    [allItems, search, typeFilter],
  )
  const paginatedState = useMemo(() => paginateReportRows(filteredItems, page), [filteredItems, page])
  const metrics = useMemo(
    () => (allItems.length ? buildAccountBalanceMetrics(allItems) : emptyAccountBalanceMetrics),
    [allItems],
  )

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  return {
    error,
    isLoading,
    items: paginatedState.rows,
    metrics,
    pagination: allItems.length ? paginatedState.pagination : reportEmptyPagination,
    refresh: loadReport,
    search,
    setPage,
    setSearch,
    setTypeFilter,
    typeFilter,
  }
}

export function useCategoryBreakdownReport() {
  const toast = useToast()
  const [allItems, setAllItems] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      setAllItems(await fetchCategoryBreakdownReport({ fromDate, toDate }))
    } catch (loadError) {
      const message = loadError.message || 'Unable to load category breakdown report.'
      setAllItems([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate, toast])

  useEffect(() => loadWithDelay(loadReport), [loadReport])

  const filteredItems = useMemo(
    () => filterCategoryBreakdownRows(allItems, { search, typeFilter }),
    [allItems, search, typeFilter],
  )
  const paginatedState = useMemo(() => paginateReportRows(filteredItems, page), [filteredItems, page])
  const metrics = useMemo(
    () => (allItems.length ? buildCategoryBreakdownMetrics(allItems) : emptyCategoryBreakdownMetrics),
    [allItems],
  )

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  return {
    error,
    fromDate,
    isLoading,
    items: paginatedState.rows,
    metrics,
    pagination: allItems.length ? paginatedState.pagination : reportEmptyPagination,
    refresh: loadReport,
    search,
    setFromDate,
    setPage,
    setSearch,
    setToDate,
    setTypeFilter,
    toDate,
    typeFilter,
  }
}
