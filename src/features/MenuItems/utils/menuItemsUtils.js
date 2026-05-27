import { MENU_ITEM_FORM_DEFAULT_VALUES, MENU_ITEMS_EMPTY_STATE } from '../constants/menuItems.constants'

const integerFormatter = new Intl.NumberFormat('en-US')

const normalizeText = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback
  }

  const normalizedValue = String(value).trim()
  return normalizedValue || fallback
}

const parseRolesFromJson = (value) => {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue.startsWith('[')) {
    return null
  }

  try {
    const parsedValue = JSON.parse(trimmedValue)
    return Array.isArray(parsedValue) ? parsedValue : null
  } catch {
    return null
  }
}

export const parseMenuItemRoles = (value) => {
  if (Array.isArray(value)) {
    return [...new Set(value.map((role) => normalizeText(role).toLowerCase()).filter(Boolean))]
  }

  const parsedJsonRoles = parseRolesFromJson(value)

  if (parsedJsonRoles) {
    return parseMenuItemRoles(parsedJsonRoles)
  }

  if (typeof value === 'string') {
    return [...new Set(value.split(',').map((role) => normalizeText(role).toLowerCase()).filter(Boolean))]
  }

  return []
}

export const formatMenuItemRoleLabel = (role) => {
  const normalizedRole = normalizeText(role, 'unknown').toLowerCase()

  if (!normalizedRole) {
    return 'Unknown'
  }

  return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)
}

export const getMenuItemRoleToneClassName = (role) => {
  switch (normalizeText(role).toLowerCase()) {
    case 'admin':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-100'
    case 'guide':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
    default:
      return 'border-slate-500/20 bg-slate-500/10 text-slate-200'
  }
}

export const getMenuItemLocationToneClassName = (location) => {
  switch (normalizeText(location, 'sidebar').toLowerCase()) {
    case 'sidebar':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
    case 'main':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-100'
    case 'bottom':
    case 'footer':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-100'
    default:
      return 'border-slate-500/20 bg-slate-500/10 text-slate-200'
  }
}

export const normalizeMenuItem = (item = {}, index = 0, pagination = {}) => {
  const roles = parseMenuItemRoles(item.roles)
  const title = normalizeText(item.title, MENU_ITEMS_EMPTY_STATE.noTitle)
  const path = normalizeText(item.path, MENU_ITEMS_EMPTY_STATE.noPath)
  const icon = normalizeText(item.icon, MENU_ITEMS_EMPTY_STATE.noIcon)
  const location = normalizeText(item.location, MENU_ITEM_FORM_DEFAULT_VALUES.location)
  const order = Number(item.order ?? 0)
  const serialBase = Number(pagination.from ?? 1) || 1

  return {
    icon,
    id: item.id ?? item.menu_id ?? `menu-item-${index + 1}`,
    location,
    order: Number.isNaN(order) ? 0 : order,
    path,
    roles,
    roleSummaryLabel: roles.length ? roles.map(formatMenuItemRoleLabel).join(', ') : 'No roles assigned',
    serial: serialBase + index,
    title,
  }
}

export const buildMenuItemMetrics = (items = [], pagination = {}) => {
  const adminCount = items.filter((item) => item.roles.includes('admin')).length
  const guideCount = items.filter((item) => item.roles.includes('guide')).length
  const sidebarCount = items.filter((item) => normalizeText(item.location).toLowerCase() === 'sidebar').length
  const totalCount = Number(pagination.total) || items.length

  return {
    adminCountLabel: integerFormatter.format(adminCount),
    guideCountLabel: integerFormatter.format(guideCount),
    sidebarCountLabel: integerFormatter.format(sidebarCount),
    totalCountLabel: integerFormatter.format(totalCount),
  }
}

export const filterMenuItemsByRole = (items = [], role = 'admin') => {
  const normalizedRole = normalizeText(role, 'admin').toLowerCase()
  return items.filter((item) => item.roles.includes(normalizedRole))
}

export const buildMenuItemFormState = (item = {}) => {
  const roles = parseMenuItemRoles(item.roles)

  return {
    icon: normalizeText(item.icon, MENU_ITEM_FORM_DEFAULT_VALUES.icon),
    location: normalizeText(item.location, MENU_ITEM_FORM_DEFAULT_VALUES.location),
    order: String(item.order ?? MENU_ITEM_FORM_DEFAULT_VALUES.order),
    path: normalizeText(item.path, MENU_ITEM_FORM_DEFAULT_VALUES.path),
    roles: roles.length ? roles : [...MENU_ITEM_FORM_DEFAULT_VALUES.roles],
    title: normalizeText(item.title, MENU_ITEM_FORM_DEFAULT_VALUES.title),
  }
}

export const buildMenuItemPayload = (formData = {}) => ({
  icon: normalizeText(formData.icon),
  location: normalizeText(formData.location, MENU_ITEM_FORM_DEFAULT_VALUES.location),
  order: Number.parseInt(formData.order, 10) || 0,
  path: normalizeText(formData.path),
  roles: parseMenuItemRoles(formData.roles),
  title: normalizeText(formData.title),
})
