import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

export function SourceChart({ data, total = 12 }) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 px-5 pb-5 lg:grid-cols-[1fr_1.25fr]">
      <div className="relative mx-auto h-[160px] w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={0} stroke="none">
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none text-white">{total}</span>
          <span className="mt-1 text-[10px] text-[#7f8ba5]">total</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[#a7b3c8]">{item.label}</span>
            <span className="ml-auto font-bold text-white">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
