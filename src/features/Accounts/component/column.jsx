export const accountColumns = [
  {
    id: 'serial',
    label: 'SL',
    accessor: 'serial',
    width: '76px',
  },
  {
    id: 'name',
    label: 'Account',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.name}</p>
        <p className="text-xs text-[#7d8ca5]">Account ID: {item.id}</p>
      </div>
    ),
    width: '22%',
  },
  {
    id: 'institution_name',
    label: 'Institution',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.institutionLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.updatedAtLabel}</p>
      </div>
    ),
    width: '24%',
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
    id: 'current_balance',
    label: 'Current Balance',
    render: (item) => <span className="text-sm font-semibold text-white">{item.currentBalanceLabel}</span>,
    width: '16%',
  },
  {
    id: 'is_active',
    label: 'Status',
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.statusToneClassName}`}
      >
        {item.statusLabel}
      </span>
    ),
    width: '12%',
  },
]
