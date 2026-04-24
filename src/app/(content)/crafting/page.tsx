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
    <div className="inline-grid grid-cols-3 gap-1 p-2 bg-surface rounded-lg border border-border flex-shrink-0">
      {grid.flat().map((slot, i) => (
        <div
          key={i}
          className="w-9 h-9 bg-background rounded border border-border flex items-center justify-center text-[10px] text-foreground-muted font-medium overflow-hidden p-0.5"
        >
          {slot ? (
            <span className="text-center leading-tight" title={slot}>
              {slot.slice(0, 5)}
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
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-2">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">크래프팅 레시피</h1>
        <p className="text-sm text-foreground-muted leading-relaxed max-w-xl">
          제작대(3x3)에서 재료를 배치해 아이템을 제작하세요. 레시피 그리드를 참고하세요.
        </p>
      </div>
      {Object.entries(byCategory).map(([cat, recipes]) => (
        <section key={cat} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold tracking-tight">{categoryLabel[cat] ?? cat}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-foreground-muted font-medium">
              {recipes.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="p-4 rounded-lg border border-border bg-surface hover:border-primary/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <RecipeGrid grid={recipe.grid} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-1">{recipe.nameKo}</h3>
                    <p className="text-xs text-foreground-muted mb-2 tabular-nums">
                      {recipe.output.item} × {recipe.output.count}
                    </p>
                    <p className="text-xs text-foreground-muted leading-relaxed">{recipe.description}</p>
                    {recipe.shapeless && (
                      <span className="text-xs px-1.5 py-0.5 rounded border border-border text-foreground-muted mt-2 inline-block">
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
