import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { emptyMenuItemsCollection, getMenuItems } from '../service/menuItemsService'

export default function useMenuItems() {
  const toast = useToast()
  const [items, setItems] = useState(emptyMenuItemsCollection.rows)
  const [pagination, setPagination] = useState(emptyMenuItemsCollection.pagination)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMenuItems = useCallback(
    async (overrides = {}) => {
      const nextPage = overrides.page ?? page
      const nextSearch = overrides.search ?? search

      setIsLoading(true)
      setError('')

      try {
        const response = await getMenuItems({ page: nextPage, search: nextSearch })
        setItems(response.rows)
        setPagination(response.pagination)
      } catch (loadError) {
        const message = loadError.message || 'Unable to load menu items.'
        setError(message)
        setItems(emptyMenuItemsCollection.rows)
        setPagination(emptyMenuItemsCollection.pagination)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [page, search, toast],
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMenuItems()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadMenuItems])

  return {
    error,
    isLoading,
    items,
    page,
    pagination,
    refresh: loadMenuItems,
    search,
    setPage,
    setSearch,
  }
}
