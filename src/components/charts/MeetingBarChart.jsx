import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { ChartTooltip } from './ChartTooltip'

export function MeetingBarChart({ data }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltip />} />
          <Bar dataKey="value" fill="#2563eb" radius={[5, 5, 5, 5]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
