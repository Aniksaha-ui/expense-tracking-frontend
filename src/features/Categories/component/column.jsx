export const categoryColumns = [
  {
    id: 'serial',
    label: 'SL',
    accessor: 'serial',
    width: '76px',
  },
  {
    id: 'name',
    label: 'Category',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.name}</p>
        <p className="text-xs text-[#7d8ca5]">Category ID: {item.id}</p>
      </div>
    ),
    width: '24%',
  },
  {
    id: 'slug',
    label: 'Slug',
    render: (item) => (
      <code className="rounded-md bg-[#211d20] px-2 py-1 text-[11px] text-[#c5d9f7]">{item.slug}</code>
    ),
    width: '20%',
  },
  {
    id: 'type',
    label: 'Type',
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.typeToneClassName}`}
      >
        {item.typeLabel}
      </span>
    ),
    width: '14%',
  },
  {
    id: 'source',
    label: 'Source',
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.sourceToneClassName}`}
      >
        {item.sourceLabel}
      </span>
    ),
    width: '14%',
  },
  {
    id: 'updated_at',
    label: 'Updated',
    render: (item) => <span className="text-sm font-medium text-[#dbe7fb]">{item.updatedAtLabel}</span>,
    width: '16%',
  },
]
