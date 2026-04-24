'use client'

import { useState } from 'react'
import type { McItem } from '@/lib/data/mc-items'

type Props = {
  items: McItem[]
}

export default function ItemGrid({ items }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? items.filter(item =>
        item.displayName.toLowerCase().includes(query.toLowerCase()) ||
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    : items

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="아이템 검색..."
          className="w-full max-w-sm px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-foreground-muted mt-2">{filtered.length}개 아이템</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-border bg-surface hover:border-primary/40 transition-all flex flex-col items-center gap-2"
          >
            <img
              src={item.iconUrl}
              alt={item.displayName}
              width={48}
              height={48}
              className="w-12 h-12 object-contain pixelated"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="text-center">
              <p className="text-xs font-medium leading-tight">{item.displayName}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5">{item.name}</p>
            </div>
            <div className="flex gap-2 text-[10px] text-foreground-muted">
              <span>x{item.stackSize}</span>
              {item.maxDurability && <span>{item.maxDurability}내구</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
