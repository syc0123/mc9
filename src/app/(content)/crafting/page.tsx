import { RECIPES } from "@/lib/data/crafting"
import type { Recipe } from "@/lib/data/crafting"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "크래프팅 레시피 — 마인크래프트 제작법 완전 정리",
  description:
    "마인크래프트의 주요 아이템 크래프팅 레시피를 그리드로 한눈에 확인하세요.",
}

const categoryLabel: Record<string, string> = {
  tools: "도구",
  weapons: "무기",
  armor: "방어구",
  building: "건축",
  food: "음식",
  redstone: "레드스톤",
  misc: "기타",
}

function RecipeGrid({ grid }: { grid: Recipe["grid"] }) {
  return (
    <div className="inline-grid grid-cols-3 gap-1 p-2 bg-gray-200 rounded-lg flex-shrink-0">
      {grid.flat().map((slot, i) => (
        <div
          key={i}
          className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-300 font-medium overflow-hidden p-0.5"
        >
          {slot ? (
            <span className="text-center leading-tight" title={slot}>
              {slot.slice(0, 6)}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function CraftingPage() {
  const byCategory = RECIPES.reduce<Record<string, typeof RECIPES>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {})

  return (
    <div>
      <h1 className="text-4xl font-bold mb-3">크래프팅 레시피</h1>
      <p className="text-gray-600 mb-8">
        제작대(3x3)에서 재료를 배치해 아이템을 제작하세요. 레시피 그리드를 참고하세요.
      </p>
      {Object.entries(byCategory).map(([cat, recipes]) => (
        <section key={cat} className="mb-10">
          <h2 className="text-2xl font-semibold mb-5">{categoryLabel[cat] ?? cat}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-5 rounded-xl border hover:border-green-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <RecipeGrid grid={recipe.grid} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{recipe.nameKo}</h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {recipe.output.item} x{recipe.output.count}
                    </p>
                    <p className="text-sm text-gray-600">{recipe.description}</p>
                    {recipe.shapeless && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 mt-2 inline-block">
                        무형
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
