'use client'

import type { McItem, McRecipe } from '@/lib/data/mc-items'
import { ItemIcon } from './ItemIcon'

type Props = {
  recipe: McRecipe
  itemMap: Map<string, McItem>
  recipeMap: Map<string, McRecipe[]>
  onNavigate: (name: string) => void
  is2x2?: boolean
}

/** Render the 3x3 (or 2x2 condensed) crafting grid. */
export function RecipeGrid({ recipe, itemMap, recipeMap, onNavigate, is2x2 = false }: Props) {
  const fullGrid: (string | null)[][] = recipe.shaped && recipe.grid
    ? recipe.grid
    : [
        [recipe.ingredients?.[0] ?? null, recipe.ingredients?.[1] ?? null, recipe.ingredients?.[2] ?? null],
        [recipe.ingredients?.[3] ?? null, recipe.ingredients?.[4] ?? null, recipe.ingredients?.[5] ?? null],
        [recipe.ingredients?.[6] ?? null, recipe.ingredients?.[7] ?? null, recipe.ingredients?.[8] ?? null],
      ]

  // Slice to 2x2 if applicable (top-left corner)
  const grid = is2x2
    ? [
        [fullGrid[0][0], fullGrid[0][1]],
        [fullGrid[1][0], fullGrid[1][1]],
      ]
    : fullGrid

  const cols = is2x2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className={`inline-grid ${cols} gap-1 p-2 bg-surface rounded-lg border border-border`}>
      {grid.flat().map((slot, i) => {
        const clickable = slot != null && recipeMap.has(slot)
        return (
          <div
            key={i}
            title={slot ? itemMap.get(slot)?.displayName ?? slot : undefined}
            onClick={() => slot && clickable && onNavigate(slot)}
            className={[
              'w-10 h-10 bg-background rounded border flex items-center justify-center overflow-hidden transition-all',
              clickable
                ? 'border-primary/60 cursor-pointer hover:border-primary hover:bg-primary/5 hover:scale-105'
                : 'border-border',
            ].join(' ')}
          >
            <ItemIcon name={slot} itemMap={itemMap} size={28} />
          </div>
        )
      })}
    </div>
  )
}
