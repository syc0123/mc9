'use client'

import { useState } from 'react'
import Link from 'next/link'
import { POTIONS, type Potion } from '@/lib/data/potions'
import { PotionIcon } from './PotionIcon'
import { IngredientIcon } from './IngredientIcon'

type FilterType = 'all' | 'positive' | 'negative' | 'mixed'

const TYPE_LABEL: Record<FilterType, string> = {
  all: '전체',
  positive: '긍정 효과',
  negative: '부정 효과',
  mixed: '복합 효과',
}

const TYPE_BADGE: Record<string, string> = {
  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  negative: 'bg-destructive/10 text-destructive border-destructive/20',
  mixed: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
}

const TYPE_DOT: Record<string, string> = {
  positive: 'bg-emerald-500',
  negative: 'bg-destructive',
  mixed: 'bg-amber-500',
}

export function PotionList() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [query, setQuery] = useState('')

  const filtered = POTIONS.filter((p) => {
    const matchType = filter === 'all' || p.type === filter
    const q = query.toLowerCase()
    const matchQuery =
      !q ||
      p.nameKo.includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.baseIngredient.includes(q)
    return matchType && matchQuery
  })

  return (
    <div>
      {/* 검색 + 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
            width="14" height="14" viewBox="0 0 16 16" fill="none"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="물약 이름 또는 재료로 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(TYPE_LABEL) as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                filter === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-foreground-muted hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {TYPE_LABEL[t]}
              <span className="ml-1.5 opacity-60">
                {t === 'all' ? POTIONS.length : POTIONS.filter((p) => p.type === t).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 없음 */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-foreground-muted text-sm">
          검색 결과가 없습니다.
        </div>
      )}

      {/* 카드 그리드 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((p) => (
          <PotionCard key={p.id} potion={p} />
        ))}
      </div>
    </div>
  )
}

function PotionCard({ potion: p }: { potion: Potion }) {
  const effect = p.effects[0]

  return (
    <Link
      href={`/potions/${p.id}`}
      className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-surface hover:border-primary/40 hover:bg-background transition-all duration-150"
    >
      <PotionIcon color={p.color} size={52} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
            {p.nameKo}
          </h3>
          {p.edition !== 'both' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-foreground-muted shrink-0 font-medium">
              {p.edition}
            </span>
          )}
        </div>

        <p className="text-[11px] text-foreground-muted mb-2 leading-none">{p.name}</p>

        <div className="flex items-center gap-1.5 mb-2.5">
          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${TYPE_BADGE[p.type]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[p.type]}`} />
            {p.type === 'positive' ? '긍정' : p.type === 'negative' ? '부정' : '복합'}
          </span>
          {effect.duration && (
            <span className="text-[10px] text-foreground-muted">{effect.duration}</span>
          )}
          {effect.amplifier && (
            <span className="text-[10px] text-foreground-muted">+{effect.amplifier} HP</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IngredientIcon iconKey={p.baseIngredientIcon} size={16} />
          <span className="text-[11px] text-foreground-muted truncate">{p.baseIngredient}</span>
        </div>
      </div>
    </Link>
  )
}
