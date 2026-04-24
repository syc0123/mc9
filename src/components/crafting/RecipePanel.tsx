'use client'

import type { McItem, McRecipe } from '@/lib/data/mc-items'
import { X, ChevronRight } from 'lucide-react'

type Props = {
  itemName: string
  itemMap: Map<string, McItem>
  recipeMap: Map<string, McRecipe[]>
  navStack: string[]
  onNavigate: (name: string) => void
  onBreadcrumb: (index: number) => void
  onClose: () => void
}

function ItemIcon({ name, itemMap, size = 32 }: { name: string | null; itemMap: Map<string, McItem>; size?: number }) {
  if (!name) return <div style={{ width: size, height: size }} />
  const item = itemMap.get(name)
  if (!item) return (
    <div
      className="flex items-center justify-center text-[8px] text-foreground-muted bg-surface border border-border rounded"
      style={{ width: size, height: size }}
    >
      {name.slice(0, 5)}
    </div>
  )
  return (
    <img
      src={item.iconUrl}
      alt={item.displayName}
      width={size}
      height={size}
      className="object-contain"
      style={{ imageRendering: 'pixelated', width: size, height: size }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

function RecipeGrid({ recipe, itemMap, recipeMap, onNavigate }: {
  recipe: McRecipe
  itemMap: Map<string, McItem>
  recipeMap: Map<string, McRecipe[]>
  onNavigate: (name: string) => void
}) {
  const grid: (string | null)[][] = recipe.shaped && recipe.grid
    ? recipe.grid
    : [
        [recipe.ingredients?.[0] ?? null, recipe.ingredients?.[1] ?? null, recipe.ingredients?.[2] ?? null],
        [recipe.ingredients?.[3] ?? null, recipe.ingredients?.[4] ?? null, recipe.ingredients?.[5] ?? null],
        [recipe.ingredients?.[6] ?? null, recipe.ingredients?.[7] ?? null, recipe.ingredients?.[8] ?? null],
      ]

  return (
    <div className="inline-grid grid-cols-3 gap-1 p-2 bg-surface rounded-lg border border-border">
      {grid.flat().map((slot, i) => {
        const clickable = slot != null && recipeMap.has(slot)
        return (
          <div
            key={i}
            title={slot ? itemMap.get(slot)?.displayName ?? slot : undefined}
            onClick={() => slot && clickable && onNavigate(slot)}
            className={[
              'w-10 h-10 bg-background rounded border flex items-center justify-center overflow-hidden transition-all',
              clickable ? 'border-primary/60 cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-105' : 'border-border',
            ].join(' ')}
          >
            <ItemIcon name={slot} itemMap={itemMap} size={28} />
          </div>
        )
      })}
    </div>
  )
}

export function RecipePanel({ itemName, itemMap, recipeMap, navStack, onNavigate, onBreadcrumb, onClose }: Props) {
  const item = itemMap.get(itemName)
  const recipes = recipeMap.get(itemName) ?? []
  const hasCraft = recipes.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-1 text-xs text-foreground-muted flex-wrap">
          {navStack.map((name, idx) => (
            <span key={idx} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight className="w-3 h-3" />}
              <button
                onClick={() => onBreadcrumb(idx)}
                className={[
                  'hover:text-foreground transition-colors',
                  idx === navStack.length - 1 ? 'text-foreground font-medium' : 'hover:underline',
                ].join(' ')}
              >
                {itemMap.get(name)?.displayName ?? name}
              </button>
            </span>
          ))}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors flex-shrink-0">
          <X className="w-4 h-4 text-foreground-muted" />
        </button>
      </div>

      {/* Item Info */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-14 h-14 flex items-center justify-center bg-surface border border-border rounded-lg">
          <ItemIcon name={itemName} itemMap={itemMap} size={40} />
        </div>
        <div>
          <p className="font-semibold">{item?.displayName ?? itemName}</p>
          <p className="text-xs text-foreground-muted font-mono">{itemName}</p>
          {item && (
            <p className="text-xs text-foreground-muted mt-0.5">
              스택: {item.stackSize}
              {item.maxDurability ? ` · 내구도: ${item.maxDurability}` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Recipes */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {hasCraft ? (
          recipes.map((recipe, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-surface">
              {!recipe.shaped && (
                <span className="text-xs px-1.5 py-0.5 rounded border border-border text-foreground-muted mb-2 inline-block">
                  무형 조합
                </span>
              )}
              <div className="flex items-start gap-3">
                <RecipeGrid recipe={recipe} itemMap={itemMap} recipeMap={recipeMap} onNavigate={onNavigate} />
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-xs text-foreground-muted mb-2">
                    결과: ×{recipe.resultCount}
                  </p>
                  <div className="space-y-1">
                    {Array.from(new Set([
                      ...(recipe.grid?.flat() ?? []),
                      ...(recipe.ingredients ?? []),
                    ].filter(Boolean) as string[])).map((ing) => (
                      <div key={ing} className="flex items-center gap-1.5">
                        <ItemIcon name={ing} itemMap={itemMap} size={16} />
                        {recipeMap.has(ing) ? (
                          <button
                            onClick={() => onNavigate(ing)}
                            className="text-xs text-primary hover:underline"
                          >
                            {itemMap.get(ing)?.displayName ?? ing}
                          </button>
                        ) : (
                          <span className="text-xs text-foreground-muted">
                            {itemMap.get(ing)?.displayName ?? ing}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 rounded-lg border border-border bg-surface text-center">
            <p className="text-sm text-foreground-muted">이 아이템은 자연에서 획득합니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
