'use client'

import type { McItem, McRecipe } from '@/lib/data/mc-items'

const categoryLabel: Record<string, string> = {
  weapons: '무기',
  tools: '도구',
  armor: '방어구',
  food: '음식',
  redstone: '레드스톤',
  misc: '기타',
}

type ItemRecord = Record<string, McItem>

function SlotIcon({ name, itemRecord }: { name: string | null; itemRecord: ItemRecord }) {
  if (!name) return <div className="w-9 h-9" />
  const item = itemRecord[name]
  if (item) {
    return (
      <div className="w-9 h-9 flex items-center justify-center" title={item.displayName}>
        <img
          src={item.iconUrl}
          alt={item.displayName}
          width={32}
          height={32}
          className="w-8 h-8 object-contain pixelated"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
    )
  }
  return (
    <div className="w-9 h-9 flex items-center justify-center text-[9px] text-foreground-muted font-medium">
      {name.slice(0, 5)}
    </div>
  )
}

function RecipeGrid({ recipe, itemRecord }: { recipe: McRecipe; itemRecord: ItemRecord }) {
  const grid: (string | null)[][] = recipe.shaped && recipe.grid
    ? recipe.grid
    : [
        [recipe.ingredients?.[0] ?? null, recipe.ingredients?.[1] ?? null, recipe.ingredients?.[2] ?? null],
        [recipe.ingredients?.[3] ?? null, recipe.ingredients?.[4] ?? null, recipe.ingredients?.[5] ?? null],
        [recipe.ingredients?.[6] ?? null, recipe.ingredients?.[7] ?? null, recipe.ingredients?.[8] ?? null],
      ]

  return (
    <div className="inline-grid grid-cols-3 gap-1 p-2 bg-surface rounded-lg border border-border flex-shrink-0">
      {grid.flat().map((slot, i) => (
        <div
          key={i}
          className="w-9 h-9 bg-background rounded border border-border flex items-center justify-center overflow-hidden"
        >
          <SlotIcon name={slot} itemRecord={itemRecord} />
        </div>
      ))}
    </div>
  )
}

type Props = {
  byCategory: Record<string, McRecipe[]>
  itemRecord: ItemRecord
}

export default function CraftingList({ byCategory, itemRecord }: Props) {
  const categoryOrder = ['weapons', 'tools', 'armor', 'food', 'redstone', 'misc']
  const sortedCategories = categoryOrder.filter(c => byCategory[c])

  return (
    <div>
      {sortedCategories.map((cat) => (
        <section key={cat} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold tracking-tight">{categoryLabel[cat] ?? cat}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-foreground-muted font-medium">
              {byCategory[cat].length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {byCategory[cat].map((recipe, idx) => {
              const resultItem = itemRecord[recipe.resultName]
              return (
                <div
                  key={`${recipe.resultName}-${idx}`}
                  className="p-4 rounded-lg border border-border bg-surface hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <RecipeGrid recipe={recipe} itemRecord={itemRecord} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {resultItem && (
                          <img
                            src={resultItem.iconUrl}
                            alt={resultItem.displayName}
                            width={20}
                            height={20}
                            className="w-5 h-5 object-contain pixelated flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        <h3 className="text-sm font-semibold truncate">
                          {resultItem?.displayName ?? recipe.resultName}
                        </h3>
                      </div>
                      <p className="text-xs text-foreground-muted mb-1 tabular-nums">
                        {recipe.resultName} × {recipe.resultCount}
                      </p>
                      {!recipe.shaped && (
                        <span className="text-xs px-1.5 py-0.5 rounded border border-border text-foreground-muted inline-block">
                          무형
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
