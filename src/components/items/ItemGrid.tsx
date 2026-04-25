'use client'

import { useEffect, useMemo, useState } from 'react'
import type { McItem } from '@/lib/data/mc-items'
import { Search, ChevronDown } from 'lucide-react'

type Props = {
  initialVersion: string
  versions: string[]
}

export default function ItemGrid({ initialVersion, versions }: Props) {
  const [version, setVersion] = useState(initialVersion)
  const [items, setItems] = useState<McItem[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/data/${version}/items.json`)
      .then(r => r.json())
      .then((data: McItem[]) => {
        if (!cancelled) {
          setItems(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [version])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      item =>
        item.displayName.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <select
            value={version}
            onChange={e => setVersion(e.target.value)}
            disabled={loading}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-border bg-surface hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-50"
          >
            {versions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="아이템 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <p className="text-xs text-foreground-muted mb-4">
        {loading ? '로딩 중...' : `${filtered.length}개 아이템`}
      </p>

      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
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
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="text-center">
              <p className="text-xs font-medium leading-tight">{item.displayName}</p>
              <p className="text-[10px] text-foreground-muted mt-0.5 font-mono">{item.name}</p>
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
