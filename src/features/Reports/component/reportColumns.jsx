export const accountBalanceColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '76px',
  },
  {
    id: 'account',
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
    id: 'institution',
    label: 'Institution',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.institutionLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.typeLabel}</p>
      </div>
    ),
    width: '22%',
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
    align: 'right',
    id: 'current_balance',
    label: 'Current Balance',
    render: (item) => <span className="text-sm font-semibold text-white">{item.currentBalanceLabel}</span>,
    width: '16%',
  },
  {
    id: 'status',
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
  {
    id: 'updated_at',
    label: 'Updated',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.updatedAtLabel}</span>,
    width: '14%',
  },
]

export const categoryBreakdownColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '76px',
  },
  {
    id: 'category',
    label: 'Category',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.categoryName}</p>
        <p className="text-xs text-[#7d8ca5]">Category ID: {item.categoryIdLabel}</p>
      </div>
    ),
    width: '26%',
  },
  {
    id: 'type',
    label: 'Type',
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.categoryTypeToneClassName}`}
      >
        {item.categoryTypeLabel}
      </span>
    ),
    width: '14%',
  },
  {
    align: 'right',
    id: 'total_amount',
    label: 'Total Amount',
    render: (item) => <span className="text-sm font-semibold text-white">{item.totalAmountLabel}</span>,
    width: '18%',
  },
  {
    align: 'right',
    id: 'share',
    label: 'Share',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.shareLabel}</span>,
    width: '12%',
  },
  {
    id: 'summary',
    label: 'Summary',
    render: (item) => (
      <div className="space-y-1">
        <p className="text-sm text-white">{item.rankLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.spendHintLabel}</p>
      </div>
    ),
    width: '18%',
  },
]

export const daywiseExpenseColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '76px',
  },
  {
    id: 'expense_date',
    label: 'Date',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.expenseDateLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.rankLabel}</p>
      </div>
    ),
    width: '18%',
  },
  {
    id: 'category',
    label: 'Category',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.categoryName}</p>
        <p className="text-xs text-[#7d8ca5]">Category ID: {item.categoryIdLabel}</p>
      </div>
    ),
    width: '24%',
  },
  {
    id: 'type',
    label: 'Type',
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.categoryTypeToneClassName}`}
      >
        {item.categoryTypeLabel}
      </span>
    ),
    width: '14%',
  },
  {
    align: 'right',
    id: 'transaction_count',
    label: 'Transactions',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.transactionCountLabel}</span>,
    width: '12%',
  },
  {
    align: 'right',
    id: 'total_amount',
    label: 'Total Amount',
    render: (item) => <span className="text-sm font-semibold text-white">{item.totalAmountLabel}</span>,
    width: '16%',
  },
  {
    align: 'right',
    id: 'share',
    label: 'Share',
    render: (item) => <span className="text-sm text-[#dbe7fb]">{item.shareLabel}</span>,
    width: '12%',
  },
]
