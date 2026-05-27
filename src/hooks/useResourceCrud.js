import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../components/common/Toaster'

const defaultPagination = {
  from: 0,
  to: 0,
  total: 0,
  currentPage: 1,
  lastPage: 1,
}

export default function useResourceCrud({ api, resourceName }) {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(defaultPagination)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)

  const loadItems = useCallback(async (overrides = {}) => {
    const nextPage = overrides.page ?? page
    const nextSearch = overrides.search ?? search

    setIsLoading(true)

    try {
      const response = await api.list({ page: nextPage, search: nextSearch })
      setItems(response.rows)
      setPagination(response.pagination)
    } catch (error) {
      toast.error(error.message || `Unable to load ${resourceName}.`)
      setItems([])
      setPagination(defaultPagination)
    } finally {
      setIsLoading(false)
    }
  }, [api, page, resourceName, search, toast])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadItems()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadItems])

  const createItem = async (payload) => {
    setIsMutating(true)
    try {
      await api.create(payload)
      toast.success(`${resourceName} created successfully.`)
      setPage(1)
      await loadItems({ page: 1 })
    } finally {
      setIsMutating(false)
    }
  }

  const updateItem = async (id, payload) => {
    setIsMutating(true)
    try {
      await api.update(id, payload)
      toast.success(`${resourceName} updated successfully.`)
      await loadItems()
    } finally {
      setIsMutating(false)
    }
  }

  const deleteItem = async (id) => {
    setIsMutating(true)
    try {
      await api.delete(id)
      toast.success(`${resourceName} deleted successfully.`)
      const shouldMoveBack = items.length === 1 && page > 1
      const nextPage = shouldMoveBack ? page - 1 : page

      if (shouldMoveBack) {
        setPage(nextPage)
      }

      await loadItems({ page: nextPage })
    } finally {
      setIsMutating(false)
    }
  }

  return {
    createItem,
    deleteItem,
    isLoading,
    isMutating,
    items,
    page,
    pagination,
    refresh: loadItems,
    search,
    setPage,
    setSearch,
    updateItem,
  }
}
