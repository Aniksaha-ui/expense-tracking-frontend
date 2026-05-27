import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import {
  buildCategoryMetrics,
  createCategory,
  deleteCategory,
  emptyCategoryMetrics,
  fetchCategoriesCollection,
  filterCategories,
  paginateCategories,
  updateCategory,
} from '../service/categoriesService'

const emptyPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

export default function useCategories() {
  const toast = useToast()
  const [allItems, setAllItems] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState('')

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const categories = await fetchCategoriesCollection()
      setAllItems(categories)
    } catch (loadError) {
      const message = loadError.message || 'Unable to load categories.'
      setAllItems([])
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategories()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadCategories])

  const filteredItems = useMemo(
    () => filterCategories(allItems, search, typeFilter),
    [allItems, search, typeFilter],
  )
  const paginatedState = useMemo(
    () => paginateCategories(filteredItems, page),
    [filteredItems, page],
  )
  const metrics = useMemo(() => buildCategoryMetrics(allItems), [allItems])

  useEffect(() => {
    if (page > paginatedState.pagination.lastPage) {
      setPage(paginatedState.pagination.lastPage)
    }
  }, [page, paginatedState.pagination.lastPage])

  const createItem = async (payload) => {
    setIsMutating(true)

    try {
      await createCategory(payload)
      toast.success('Category created successfully.')
      setPage(1)
      await loadCategories()
    } finally {
      setIsMutating(false)
    }
  }

  const updateItem = async (id, payload) => {
    setIsMutating(true)

    try {
      await updateCategory(id, payload)
      toast.success('Category updated successfully.')
      await loadCategories()
    } finally {
      setIsMutating(false)
    }
  }

  return {
    createItem,
    deleteItem: deleteCategory,
    error,
    isLoading,
    isMutating,
    items: paginatedState.rows,
    metrics: allItems.length ? metrics : emptyCategoryMetrics,
    page,
    pagination: allItems.length ? paginatedState.pagination : emptyPagination,
    refresh: loadCategories,
    search,
    setPage,
    setSearch,
    setTypeFilter,
    typeFilter,
    updateItem,
  }
}
