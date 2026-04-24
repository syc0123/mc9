'use client'

import { useState, useMemo } from 'react'
import type { McItem, McRecipe } from '@/lib/data/mc-items'
import { ItemGrid } from './ItemGrid'
import { RecipePanel } from './RecipePanel'
import { Search, ChevronDown } from 'lucide-react'

type Props = {
  initialItems: McItem[]
  initialRecipes: McRecipe[]
  initialVersion: string
  versions: string[]
}

export function CraftingEncyclopedia({ initialItems, initialRecipes, initialVersion, versions }: Props) {
  const [version, setVersion] = useState(initialVersion)
  const [items, setItems] = useState<McItem[]>(initialItems)
  const [recipes, setRecipes] = useState<McRecipe[]>(initialRecipes)
  const [search, setSearch] = useState('')
  const [navStack, setNavStack] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const recipeMap = useMemo(() => {
    const map = new Map<string, McRecipe[]>()
    for (const r of recipes) {
      if (!r.resultName) continue
      const arr = map.get(r.resultName) ?? []
      arr.push(r)
      map.set(r.resultName, arr)
    }
    return map
  }, [recipes])

  const itemMap = useMemo(() => new Map(items.map(i => [i.name, i])), [items])

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      i => i.name.toLowerCase().includes(q) || i.displayName.toLowerCase().includes(q)
    )
  }, [items, search])

  async function handleVersionChange(v: string) {
    setLoading(true)
    const [itemsRes, recipesRes] = await Promise.all([
      fetch(`/data/${v}/items.json`),
      fetch(`/data/${v}/recipes.json`),
    ])
    const [newItems, newRecipes] = await Promise.all([itemsRes.json(), recipesRes.json()])
    setItems(newItems)
    setRecipes(newRecipes)
    setVersion(v)
    setNavStack([])
    setLoading(false)
  }

  function handleSelect(name: string) {
    setNavStack([name])
  }

  function handleNavigate(name: string) {
    setNavStack(prev => [...prev, name])
  }

  function handleBreadcrumb(index: number) {
    setNavStack(prev => prev.slice(0, index + 1))
  }

  function handleClose() {
    setNavStack([])
  }

  const currentItem = navStack[navStack.length - 1] ?? null

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-1">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-1">아이템 사전</h1>
        <p className="text-sm text-foreground-muted">
          버전별 전체 아이템과 조합법. 아이콘을 클릭해 조합법을 탐색하세요.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="relative">
          <select
            value={version}
            onChange={e => handleVersionChange(e.target.value)}
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
            placeholder="아이템 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-primary/50 bg-primary/5 inline-block" />
            조합 가능
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-border bg-surface inline-block opacity-60" />
            자연 획득
          </span>
        </div>
      </div>

      {/* Stats */}
      <p className="text-xs text-foreground-muted mb-3">
        {loading ? '로딩 중...' : `${filtered.length}개 아이템 · 레시피 있는 아이템: ${recipeMap.size}개`}
      </p>

      {/* Main layout */}
      <div className={`flex gap-4 flex-1 min-h-0 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Item Grid */}
        <div className={`flex-1 overflow-y-auto ${currentItem ? 'hidden lg:block lg:flex-1' : ''}`}>
          <ItemGrid
            items={filtered}
            recipeMap={recipeMap}
            selected={currentItem}
            onSelect={handleSelect}
          />
        </div>

        {/* Recipe Panel */}
        {currentItem && (
          <div className="w-full lg:w-80 flex-shrink-0 border border-border rounded-xl bg-surface p-4 flex flex-col min-h-0 max-h-[600px] lg:max-h-none overflow-hidden">
            <RecipePanel
              itemName={currentItem}
              itemMap={itemMap}
              recipeMap={recipeMap}
              navStack={navStack}
              onNavigate={handleNavigate}
              onBreadcrumb={handleBreadcrumb}
              onClose={handleClose}
            />
          </div>
        )}
      </div>
    </div>
  )
}
