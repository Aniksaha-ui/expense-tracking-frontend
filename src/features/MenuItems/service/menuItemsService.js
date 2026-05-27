import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import {
  assertSuccessfulExecution,
  buildQueryPath,
  unwrapCollection,
  unwrapResponseData,
} from '../../../services/resourceApi'
import { buildMenuItemFormState, normalizeMenuItem } from '../utils/menuItemsUtils'

const defaultPagination = {
  currentPage: 1,
  from: 0,
  lastPage: 1,
  to: 0,
  total: 0,
}

const extractMenuItemRecord = (payload) => payload?.data ?? payload ?? {}

export const emptyMenuItemsCollection = {
  pagination: defaultPagination,
  rows: [],
}

export const getMenuItems = async ({ page = 1, search = '' } = {}) => {
  const payload = await apiRequest(buildQueryPath(API_URLS.menuItems.list, { page, search }))
  const collection = unwrapCollection(payload, 'Unable to load menu items.')

  return {
    pagination: collection.pagination,
    rows: collection.rows.map((item, index) => normalizeMenuItem(item, index, collection.pagination)),
  }
}

export const getMenuItemById = async (menuItemId) => {
  const payload = await apiRequest(API_URLS.menuItems.byId(menuItemId))
  const data = extractMenuItemRecord(unwrapResponseData(payload, 'Unable to load menu item details.'))
  return buildMenuItemFormState(data)
}

export const createMenuItem = async (payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.menuItems.list, {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to create menu item.',
  )

export const updateMenuItem = async (menuItemId, payload) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.menuItems.update(menuItemId), {
      body: JSON.stringify(payload),
      method: 'POST',
    }),
    'Unable to update menu item.',
  )

export const deleteMenuItem = async (menuItemId) =>
  assertSuccessfulExecution(
    await apiRequest(API_URLS.menuItems.byId(menuItemId), {
      method: 'DELETE',
    }),
    'Unable to delete menu item.',
  )
