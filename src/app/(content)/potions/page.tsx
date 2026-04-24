import Link from "next/link"
import { POTIONS } from "@/lib/data/potions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "포션 사전 — 모든 마인크래프트 포션 조합법",
  description:
    "마인크래프트의 모든 포션 조합법, 재료, 효과를 한눈에. 치유, 재생, 힘, 속도 등 Java & Bedrock 버전별 정리.",
}

const typeLabel: Record<string, string> = {
  positive: "긍정 효과",
  negative: "부정 효과",
  mixed: "복합 효과",
}

const typeBadge: Record<string, string> = {
  positive: "bg-primary/10 text-primary border-primary/20",
  negative: "bg-destructive/10 text-destructive border-destructive/20",
  mixed: "bg-foreground-muted/10 text-foreground-muted border-border",
}

export default function PotionsPage() {
  const byType = {
    positive: POTIONS.filter((p) => p.type === "positive"),
    negative: POTIONS.filter((p) => p.type === "negative"),
    mixed: POTIONS.filter((p) => p.type === "mixed"),
  }

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-2">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">포션 사전</h1>
        <p className="text-sm text-foreground-muted leading-relaxed max-w-xl">
          마인크래프트의 모든 포션 조합법과 효과를 정리했습니다. 양조대에서 물약 병 + 재료로 제작하세요.
        </p>
      </div>

      {(Object.entries(byType) as [string, typeof POTIONS][]).map(
        ([type, potions]) =>
          potions.length > 0 && (
            <section key={type} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold tracking-tight">{typeLabel[type]}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeBadge[type]}`}>
                  {potions.length}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {potions.map((potion) => (
                  <Link
                    key={potion.id}
                    href={`/potions/${potion.id}`}
                    className="group p-4 rounded-lg border border-border bg-surface hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {potion.nameKo}
                      </h3>
                      {potion.edition !== "both" && (
                        <span className="text-xs px-1.5 py-0.5 rounded border border-border text-foreground-muted shrink-0 ml-2">
                          {potion.edition}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted mb-1.5">{potion.baseIngredient}</p>
                    <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">{potion.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )
      )}
    </div>
  )
}
