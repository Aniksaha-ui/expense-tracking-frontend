export function ChartTooltip({ active, payload, formatter }) {
  if (!active || !payload?.length) return null

  const value = formatter ? formatter(payload[0].value) : payload[0].value

  return (
    <div className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-lg">
      {value}
    </div>
  )
}
