'use client'

import { useState, useMemo, useEffect } from 'react'
import type { McItem, McRecipe, SmeltingRecipe, InteractionRecipe } from '@/lib/data/mc-items'
import { HIDDEN_ITEMS } from '@/lib/data/mc-items'
import { ItemGrid } from './ItemGrid'
import { RecipePanel } from './RecipePanel'
import { Search, ChevronDown } from 'lucide-react'

type Props = {
  initialVersion: string
  versions: string[]
}

type SmeltingMap = Record<string, SmeltingRecipe>
type InteractionMap = Record<string, InteractionRecipe>

export function CraftingEncyclopedia({ initialVersion, versions }: Props) {
  const [version, setVersion] = useState(initialVersion)
  const [items, setItems] = useState<McItem[]>([])
  const [recipes, setRecipes] = useState<McRecipe[]>([])
  const [smelting, setSmelting] = useState<SmeltingMap>({})
  const [interactions, setInteractions] = useState<InteractionMap>({})
  const [search, setSearch] = useState('')
  const [navStack, setNavStack] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVersion(initialVersion)
    // Smelting + interactions are version-agnostic; load once
    Promise.all([
      fetch('/data/smelting.json').then(r => r.json()).catch(() => ({})),
      fetch('/data/interactions.json').then(r => r.json()).catch(() => ({})),
    ]).then(([s, i]) => {
      setSmelting(s)
      setInteractions(i)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadVersion(v: string) {
    setLoading(true)
    const [itemsRes, recipesRes] = await Promise.all([
      fetch(`/data/${v}/items.json`),
      fetch(`/data/${v}/recipes.json`),
    ])
    const [newItems, newRecipes] = await Promise.all([itemsRes.json(), recipesRes.json()])
    // Filter hidden items (air, cave_air, void_air)
    setItems((newItems as McItem[]).filter(i => !HIDDEN_ITEMS.has(i.name)))
    setRecipes(newRecipes)
    setLoading(false)
  }

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
    setVersion(v)
    setNavStack([])
    await loadVersion(v)
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
    <div className="flex flex-col">
      {/* Page Header */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-1">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-1">아이템 사전</h1>
        <p className="text-sm text-foreground-muted">
          버전별 전체 아이템과 조합법, 화로 제련, 상호작용 제작법. 아이콘을 클릭해 탐색하세요.
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
            제작 가능
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-border bg-surface inline-block opacity-60" />
            기타
          </span>
        </div>
      </div>

      {/* Stats */}
      <p className="text-xs text-foreground-muted mb-3">
        {loading ? '로딩 중...' : `${filtered.length}개 아이템`}
      </p>

      {/* Main layout — page-level scroll, recipe panel sticks below sticky navbar */}
      <div className={`flex gap-4 items-start ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Item Grid (extra padding so selected ring/scale-110 isn't clipped by container edges) */}
        <div className={`flex-1 min-w-0 px-1 py-1 ${currentItem ? 'hidden lg:block' : ''}`}>
          <ItemGrid
            items={filtered}
            recipeMap={recipeMap}
            smeltingMap={smelting}
            interactionsMap={interactions}
            selected={currentItem}
            onSelect={handleSelect}
          />
        </div>

        {/* Recipe Panel — sticky below navbar (h-14 = top-14), max-height fits viewport */}
        {currentItem && (
          <div className="w-full lg:w-96 flex-shrink-0 border border-border rounded-xl bg-surface p-4 flex flex-col lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
            <RecipePanel
              itemName={currentItem}
              itemMap={itemMap}
              recipeMap={recipeMap}
              smeltingMap={smelting}
              interactionsMap={interactions}
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
