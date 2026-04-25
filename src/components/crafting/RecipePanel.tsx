'use client'

import type { McItem, McRecipe, SmeltingRecipe, InteractionRecipe } from '@/lib/data/mc-items'
import { is2x2Recipe } from '@/lib/data/mc-items'
import { X, ChevronRight, Hammer, Flame, Hand, ArrowRight, Info } from 'lucide-react'
import { ItemIcon } from './ItemIcon'
import { RecipeGrid } from './RecipeGrid'

type Props = {
  itemName: string
  itemMap: Map<string, McItem>
  recipeMap: Map<string, McRecipe[]>
  smeltingMap: Record<string, SmeltingRecipe>
  interactionsMap: Record<string, InteractionRecipe>
  navStack: string[]
  onNavigate: (name: string) => void
  onBreadcrumb: (index: number) => void
  onClose: () => void
}

export function RecipePanel({
  itemName, itemMap, recipeMap, smeltingMap, interactionsMap,
  navStack, onNavigate, onBreadcrumb, onClose,
}: Props) {
  const item = itemMap.get(itemName)
  const recipes = recipeMap.get(itemName) ?? []
  const smelt = smeltingMap[itemName]
  const interact = interactionsMap[itemName]
  const hasAny = recipes.length > 0 || !!smelt || !!interact

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
                  'hover:text-foreground transition-colors cursor-pointer',
                  idx === navStack.length - 1 ? 'text-foreground font-medium' : 'hover:underline',
                ].join(' ')}
              >
                {itemMap.get(name)?.displayName ?? name}
              </button>
            </span>
          ))}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors flex-shrink-0 cursor-pointer">
          <X className="w-4 h-4 text-foreground-muted" />
        </button>
      </div>

      {/* Item Info */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <div className="w-14 h-14 flex items-center justify-center bg-background border border-border rounded-lg">
          <ItemIcon name={itemName} itemMap={itemMap} size={48} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{item?.displayName ?? itemName}</p>
          <p className="text-xs text-foreground-muted font-mono truncate">{itemName}</p>
        </div>
      </div>

      {/* Recipes */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-1">
        {/* Crafting recipes */}
        {recipes.map((recipe, idx) => (
          <CraftingSection
            key={`craft-${idx}`}
            recipe={recipe}
            itemMap={itemMap}
            recipeMap={recipeMap}
            onNavigate={onNavigate}
          />
        ))}

        {/* Smelting */}
        {smelt && (
          <SmeltingSection
            smelt={smelt}
            itemMap={itemMap}
            recipeMap={recipeMap}
            smeltingMap={smeltingMap}
            interactionsMap={interactionsMap}
            resultName={itemName}
            onNavigate={onNavigate}
          />
        )}

        {/* Interaction */}
        {interact && (
          <InteractionSection
            interact={interact}
            itemMap={itemMap}
            resultName={itemName}
            onNavigate={onNavigate}
          />
        )}

        {!hasAny && (
          <div className="p-4 rounded-lg border border-border bg-background text-center">
            <Info className="w-5 h-5 text-foreground-muted mx-auto mb-2" />
            <p className="text-sm text-foreground-muted">자연에서 획득하거나 몹에게서 드롭됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sections ────────────────────────────────────────────────────────────────

function CraftingSection({
  recipe, itemMap, recipeMap, onNavigate,
}: {
  recipe: McRecipe
  itemMap: Map<string, McItem>
  recipeMap: Map<string, McRecipe[]>
  onNavigate: (name: string) => void
}) {
  const is2x2 = recipe.shaped && is2x2Recipe(recipe.grid)

  return (
    <div className="p-3 rounded-lg border border-border bg-background">
      <SectionHeader icon={<Hammer className="w-3.5 h-3.5" />} label="제작대 조합" />
      {!recipe.shaped && (
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-foreground-muted mb-2 inline-block">
          무형 조합
        </span>
      )}
      <div className="flex items-start gap-3 flex-wrap">
        <RecipeGrid recipe={recipe} itemMap={itemMap} recipeMap={recipeMap} onNavigate={onNavigate} is2x2={is2x2} />
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-foreground-muted" />
          <ResultBadge count={recipe.resultCount} />
        </div>
      </div>
    </div>
  )
}

function SmeltingSection({
  smelt, itemMap, recipeMap, smeltingMap, interactionsMap, resultName, onNavigate,
}: {
  smelt: SmeltingRecipe
  itemMap: Map<string, McItem>
  recipeMap: Map<string, McRecipe[]>
  smeltingMap: Record<string, SmeltingRecipe>
  interactionsMap: Record<string, InteractionRecipe>
  resultName: string
  onNavigate: (name: string) => void
}) {
  const toolName = smelt.tool === 'furnace' ? '화로' : smelt.tool
  const altToolName = smelt.alt_tool === 'blast_furnace' ? '용광로' : smelt.alt_tool === 'smoker' ? '훈연기' : smelt.alt_tool

  return (
    <div className="p-3 rounded-lg border border-border bg-background">
      <SectionHeader icon={<Flame className="w-3.5 h-3.5" />} label={`${toolName} 제련${altToolName ? ` · ${altToolName}` : ''}`} />
      <p className="text-xs text-foreground-muted mb-2">아래 재료를 {toolName}에 넣으면 만들어집니다</p>
      <div className="space-y-1.5">
        {smelt.from.map(ing => {
          const clickable = recipeMap.has(ing) || smeltingMap[ing] || interactionsMap[ing]
          return (
            <div key={ing} className="flex items-center gap-2 p-1.5 rounded bg-surface border border-border">
              <ItemIcon name={ing} itemMap={itemMap} size={28} />
              {clickable ? (
                <button
                  onClick={() => onNavigate(ing)}
                  className="text-sm text-primary hover:underline cursor-pointer truncate"
                >
                  {itemMap.get(ing)?.displayName ?? ing}
                </button>
              ) : (
                <span className="text-sm text-foreground truncate">
                  {itemMap.get(ing)?.displayName ?? ing}
                </span>
              )}
              <ArrowRight className="w-3.5 h-3.5 text-foreground-muted ml-auto flex-shrink-0" />
              <ItemIcon name={resultName} itemMap={itemMap} size={24} />
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-foreground-muted mt-2">경험치 +{smelt.xp}</p>
    </div>
  )
}

function InteractionSection({
  interact, itemMap, resultName, onNavigate,
}: {
  interact: InteractionRecipe
  itemMap: Map<string, McItem>
  resultName: string
  onNavigate: (name: string) => void
}) {
  const baseLabel = itemMap.get(interact.base)?.displayName ?? interact.base
  const toolLabel = interact.tool ? (itemMap.get(interact.tool)?.displayName ?? interact.tool) : null
  const resultLabel = itemMap.get(resultName)?.displayName ?? resultName

  let description = interact.note ?? ''
  if (!description) {
    if (interact.method === 'use' && interact.tool) {
      description = `${baseLabel}에 ${toolLabel}을(를) 사용하면 ${resultLabel}이(가) 됩니다`
    } else if (interact.method === 'natural') {
      description = `${baseLabel}이(가) 시간이 지나면서 자연스럽게 ${resultLabel}으로 변합니다`
    } else if (interact.method === 'craft') {
      description = `${baseLabel}로 ${resultLabel}을(를) 만들 수 있습니다`
    }
  }

  return (
    <div className="p-3 rounded-lg border border-border bg-background">
      <SectionHeader icon={<Hand className="w-3.5 h-3.5" />} label="상호작용" />
      <p className="text-xs text-foreground-muted mb-2.5">{description}</p>
      <div className="flex items-center gap-2 p-1.5 rounded bg-surface border border-border">
        <button
          onClick={() => onNavigate(interact.base)}
          className="flex items-center gap-1.5 hover:bg-accent rounded px-1 py-0.5 cursor-pointer"
        >
          <ItemIcon name={interact.base} itemMap={itemMap} size={28} />
          <span className="text-xs text-primary truncate">{baseLabel}</span>
        </button>
        {interact.tool && (
          <>
            <span className="text-foreground-muted text-xs">+</span>
            <button
              onClick={() => onNavigate(interact.tool!)}
              className="flex items-center gap-1.5 hover:bg-accent rounded px-1 py-0.5 cursor-pointer"
            >
              <ItemIcon name={interact.tool} itemMap={itemMap} size={28} />
              <span className="text-xs text-primary truncate">{toolLabel}</span>
            </button>
          </>
        )}
        <ArrowRight className="w-3.5 h-3.5 text-foreground-muted ml-auto flex-shrink-0" />
        <ItemIcon name={resultName} itemMap={itemMap} size={28} />
      </div>
    </div>
  )
}

// ── Shared ──────────────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-foreground">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  )
}

function ResultBadge({ count }: { count: number }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
      ×{count}
    </span>
  )
}
