'use client'

import type { McItem } from '@/lib/data/mc-items'

type Props = {
  items: McItem[]
  recipeMap: Map<string, unknown[]>
  selected: string | null
  onSelect: (name: string) => void
}

export function ItemGrid({ items, recipeMap, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1">
      {items.map((item) => {
        const hasCraft = recipeMap.has(item.name)
        const isSelected = selected === item.name
        return (
          <button
            key={item.id}
            title={`${item.displayName} (${item.name})`}
            onClick={() => onSelect(item.name)}
            className={[
              'w-12 h-12 flex items-center justify-center rounded border transition-all',
              'hover:scale-110 hover:z-10 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              hasCraft
                ? 'border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10'
                : 'border-border bg-surface opacity-60 hover:opacity-90',
              isSelected ? 'ring-2 ring-primary scale-110' : '',
            ].join(' ')}
          >
            <img
              src={item.iconUrl}
              alt={item.displayName}
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
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
