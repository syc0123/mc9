import { getRecipes, getItems } from "@/lib/data/mc-items"
import type { McRecipe } from "@/lib/data/mc-items"
import CraftingList from "@/components/crafting/CraftingList"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "크래프팅 레시피 — 마인크래프트 제작법 완전 정리",
  description:
    "마인크래프트의 주요 아이템 크래프팅 레시피를 그리드로 한눈에 확인하세요.",
}

function getCategory(name: string): string {
  if (['sword', 'axe', 'bow', 'crossbow', 'trident', 'mace'].some(w => name.includes(w))) return 'weapons'
  if (['pickaxe', 'shovel', 'hoe', 'shears', 'flint_and_steel'].some(w => name.includes(w))) return 'tools'
  if (['helmet', 'chestplate', 'leggings', 'boots'].some(w => name.includes(w))) return 'armor'
  if (['bread', 'cake', 'cookie', 'pie', 'stew', 'soup'].some(w => name.includes(w))) return 'food'
  if (['piston', 'repeater', 'comparator', 'hopper', 'dispenser', 'dropper', 'observer'].some(w => name.includes(w))) return 'redstone'
  return 'misc'
}

export default function CraftingPage() {
  const recipes = getRecipes()
  const items = getItems()

  const itemRecord = Object.fromEntries(items.map(i => [i.name, i]))

  const byCategory = recipes.reduce<Record<string, McRecipe[]>>((acc, r) => {
    const cat = getCategory(r.resultName)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-2">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">크래프팅 레시피</h1>
        <p className="text-sm text-foreground-muted leading-relaxed max-w-xl">
          제작대(3x3)에서 재료를 배치해 아이템을 제작하세요. 레시피 그리드를 참고하세요.
        </p>
      </div>
      <CraftingList byCategory={byCategory} itemRecord={itemRecord} />
    </div>
  )
}
