export const transferColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '76px',
  },
  {
    id: 'transfer',
    label: 'Transfer',
    render: (item) => (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.flowToneClassName}`}
          >
            {item.flowLabel}
          </span>
          <span className="text-xs text-[#7d8ca5]">TRF #{item.id}</span>
        </div>
        <p className="text-sm text-white">{item.noteLabel}</p>
      </div>
    ),
    width: '25%',
  },
  {
    id: 'from_account',
    label: 'Source',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.fromAccountLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.fromAccountTypeLabel}</p>
      </div>
    ),
    width: '18%',
  },
  {
    id: 'to_account',
    label: 'Destination',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.toAccountLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.toAccountTypeLabel}</p>
      </div>
    ),
    width: '18%',
  },
  {
    id: 'transfer_date',
    label: 'Date',
    render: (item) => <span className="text-sm font-medium text-white">{item.transferDateLabel}</span>,
    width: '15%',
  },
  {
    align: 'right',
    id: 'amount',
    label: 'Amount',
    render: (item) => <span className="text-sm font-semibold text-white">{item.amountLabel}</span>,
    width: '14%',
  },
]
