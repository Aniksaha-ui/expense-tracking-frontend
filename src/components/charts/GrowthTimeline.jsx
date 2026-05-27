export function GrowthTimeline({ months }) {
  return (
    <div className="flex h-full min-h-[300px] flex-col justify-end px-5 pb-6">
      <div className="mb-4 grid grid-cols-12 text-center text-[10px] text-[#657696]">
        {months.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-[#a7b3c8]">
        <span className="h-3 w-3 rounded-sm bg-emerald-500" />
        <span>New</span>
      </div>
    </div>
  )
}
