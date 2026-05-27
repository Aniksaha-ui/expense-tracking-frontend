export const MENU_ITEMS_PAGE_COPY = {
  title: 'Menu Management',
  subtitle:
    'Manage application navigation and role visibility, keep admin and guide menus organized, and update sidebar access from one workspace.',
  searchPlaceholder: 'Search by title, path, icon, location, role, or menu ID',
  newButtonLabel: 'Create Menu Item',
}

export const MENU_ITEM_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin Menu' },
  { value: 'guide', label: 'Guide Menu' },
]

export const MENU_ITEM_LOCATION_SUGGESTIONS = ['sidebar', 'main', 'bottom', 'footer', 'header']

export const MENU_ITEM_FORM_DEFAULT_VALUES = {
  icon: '',
  location: 'sidebar',
  order: '0',
  path: '',
  roles: ['admin'],
  title: '',
}

export const MENU_ITEMS_EMPTY_STATE = {
  noIcon: 'No icon',
  noItems: 'No menu items found.',
  noPath: 'No route provided',
  noTitle: 'Untitled menu item',
}
