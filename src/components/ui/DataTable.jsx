export function DataTable({ columns, data, keyField = 'id', emptyMessage = 'No data found' }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead className="border-y border-slate-100 bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-sm">
          {data.length ? (
            data.map((row) => (
              <tr key={row[keyField]} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-4 ${column.cellClassName ?? ''}`}>
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center font-medium text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
