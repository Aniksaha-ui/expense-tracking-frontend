import {
  formatMenuItemRoleLabel,
  getMenuItemLocationToneClassName,
  getMenuItemRoleToneClassName,
} from '../utils/menuItemsUtils'

export const menuItemsColumns = [
  {
    id: 'serial',
    label: 'SL',
    accessor: 'serial',
    width: '76px',
  },
  {
    id: 'title',
    label: 'Menu Item',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.title}</p>
        <p className="text-xs text-[#7d8ca5]">Menu ID: {item.id}</p>
      </div>
    ),
    width: '22%',
  },
  {
    id: 'path',
    label: 'Path',
    render: (item) => (
      <div className="space-y-1">
        <code className="rounded-md bg-[#211d20] px-2 py-1 text-[11px] text-[#c5d9f7]">{item.path}</code>
        <p className="text-xs text-[#7d8ca5]">{item.roleSummaryLabel}</p>
      </div>
    ),
    width: '28%',
  },
  {
    id: 'icon',
    label: 'Icon',
    render: (item) => (
      <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-100">
        {item.icon}
      </span>
    ),
    width: '14%',
  },
  {
    id: 'location',
    label: 'Location',
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getMenuItemLocationToneClassName(
          item.location,
        )}`}
      >
        {item.location}
      </span>
    ),
    width: '12%',
  },
  {
    id: 'order',
    label: 'Order',
    render: (item) => <span className="text-sm font-semibold text-[#dbe7fb]">{item.order}</span>,
    width: '10%',
  },
  {
    id: 'roles',
    label: 'Roles',
    render: (item) => (
      <div className="flex flex-wrap gap-2">
        {item.roles.map((role) => (
          <span
            key={`${item.id}-${role}`}
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getMenuItemRoleToneClassName(
              role,
            )}`}
          >
            {formatMenuItemRoleLabel(role)}
          </span>
        ))}
      </div>
    ),
    width: '14%',
  },
]
