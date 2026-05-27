export const recurringExpenseColumns = [
  {
    accessor: 'serial',
    id: 'serial',
    label: 'SL',
    width: '76px',
  },
  {
    id: 'title',
    label: 'Plan',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-white">{item.title}</p>
        <p className="text-xs text-[#7d8ca5]">Recurring ID: {item.id}</p>
      </div>
    ),
    width: '20%',
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
    width: '16%',
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
    width: '14%',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    render: (item) => (
      <div className="space-y-1">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${item.frequencyToneClassName}`}
        >
          {item.frequencyLabel}
        </span>
        <p className="text-xs text-[#7d8ca5]">Start: {item.startDateLabel}</p>
        <p className="text-xs text-[#7d8ca5]">End: {item.endDateLabel}</p>
      </div>
    ),
    width: '18%',
  },
  {
    id: 'next_run_date',
    label: 'Next Run',
    render: (item) => (
      <div className="space-y-1">
        <p className="font-medium text-white">{item.nextRunDateLabel}</p>
        <p className="text-xs text-[#7d8ca5]">Last: {item.lastRunAtLabel}</p>
      </div>
    ),
    width: '14%',
  },
  {
    align: 'right',
    id: 'amount',
    label: 'Amount',
    render: (item) => <span className="text-sm font-semibold text-white">{item.amountLabel}</span>,
    width: '12%',
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
]
