export const transactionColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '76px',
  },
  {
    id: 'transaction',
    label: 'Transaction',
    render: (item) => (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.typeToneClassName}`}
          >
            {item.typeLabel}
          </span>
          <span className="text-xs text-[#7d8ca5]">TXN #{item.id}</span>
        </div>
        <p className="text-sm text-white">{item.noteLabel}</p>
      </div>
    ),
    width: '24%',
  },
  {
    id: 'account',
    label: 'Account',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.accountLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.accountTypeLabel}</p>
      </div>
    ),
    width: '18%',
  },
  {
    id: 'category',
    label: 'Category',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-[#dbe7fb]">{item.categoryLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.categoryTypeLabel}</p>
      </div>
    ),
    width: '18%',
  },
  {
    id: 'transaction_date',
    label: 'Date',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{item.transactionDateLabel}</p>
        <p className="text-xs text-[#7d8ca5]">{item.referenceLabel}</p>
      </div>
    ),
    width: '15%',
  },
  {
    align: 'right',
    id: 'amount',
    label: 'Amount',
    render: (item) => (
      <div className="space-y-1 text-right">
        <p className={`text-sm font-semibold ${item.amountToneClassName}`}>{item.amountLabel}</p>
        <p className="text-xs text-[#7d8ca5]">Before: {item.balanceBeforeLabel}</p>
      </div>
    ),
    width: '13%',
  },
  {
    align: 'right',
    id: 'balance_after',
    label: 'Balance After',
    render: (item) => (
      <span className="text-sm font-semibold text-white">{item.balanceAfterLabel}</span>
    ),
    width: '12%',
  },
]
