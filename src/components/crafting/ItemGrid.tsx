'use client'

import type { McItem, SmeltingRecipe, InteractionRecipe } from '@/lib/data/mc-items'

type Props = {
  items: McItem[]
  recipeMap: Map<string, unknown[]>
  smeltingMap: Record<string, SmeltingRecipe>
  interactionsMap: Record<string, InteractionRecipe>
  selected: string | null
  onSelect: (name: string) => void
}

export function ItemGrid({ items, recipeMap, smeltingMap, interactionsMap, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5">
      {items.map((item) => {
        const hasCraft = recipeMap.has(item.name)
        const hasSmelt = !!smeltingMap[item.name]
        const hasInteract = !!interactionsMap[item.name]
        const obtainable = hasCraft || hasSmelt || hasInteract
        const isSelected = selected === item.name
        return (
          <button
            key={item.id}
            title={`${item.displayName} (${item.name})`}
            onClick={() => onSelect(item.name)}
            className={[
              'w-16 h-16 flex items-center justify-center rounded border transition-all',
              'hover:scale-110 hover:z-10 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer',
              obtainable
                ? 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
                : 'border-border bg-surface opacity-70 hover:opacity-100',
              isSelected ? 'ring-2 ring-primary scale-110' : '',
            ].join(' ')}
          >
            <img
              src={item.iconUrl}
              alt={item.displayName}
              width={52}
              height={52}
              className="w-[52px] h-[52px] object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
                el.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <span className="hidden text-[8px] text-foreground-muted font-medium leading-tight text-center px-0.5 break-all">
              {item.name.slice(0, 6)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
