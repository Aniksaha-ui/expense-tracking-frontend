import { Badge } from './Badge'

export function ListCard({ items }) {
  return (
    <div className="divide-y divide-[#312b2e]">
      {items.map((item) => (
        <article key={item.id} className="flex min-h-[63px] items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-white">{item.name}</h4>
            <p className="mt-1 truncate text-xs text-[#7787a6]">{item.meta}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {item.source && <Badge>{item.source}</Badge>}
            <Badge>{item.status}</Badge>
          </div>
        </article>
      ))}
    </div>
  )
}
