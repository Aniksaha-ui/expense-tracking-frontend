export function ReportDateRangeFilters({ apiState }) {
  const hasFiltersApplied =
    apiState.fromDate !== apiState.defaultDateRange.fromDate ||
    apiState.toDate !== apiState.defaultDateRange.toDate

  return (
    <div className="report-date-filters">
      <label className="crud-field report-date-filters__field">
        <span>From Date</span>
        <input type="date" value={apiState.fromDate} onChange={(event) => { apiState.setPage(1); apiState.setFromDate(event.target.value) }} />
      </label>
      <label className="crud-field report-date-filters__field">
        <span>To Date</span>
        <input type="date" value={apiState.toDate} onChange={(event) => { apiState.setPage(1); apiState.setToDate(event.target.value) }} />
      </label>
      <div className="report-date-filters__action">
        <button type="button" className="crud-button crud-button--ghost" disabled={!hasFiltersApplied} onClick={() => { apiState.setPage(1); apiState.setFromDate(apiState.defaultDateRange.fromDate); apiState.setToDate(apiState.defaultDateRange.toDate) }}>
          Clear Date Range
        </button>
      </div>
    </div>
  )
}
