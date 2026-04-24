import Link from "next/link"
import { ENCHANTS } from "@/lib/data/enchants"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "인챈트 가이드 — 마인크래프트 모든 인챈트 정리",
  description:
    "마인크래프트의 모든 인챈트 효과, 최대 레벨, 호환/비호환 조합을 정리했습니다.",
}

const categoryLabel: Record<string, string> = {
  weapon: "무기",
  armor: "갑옷",
  tool: "도구",
  bow: "활",
  universal: "공통",
  fishing: "낚싯대",
  crossbow: "석궁",
  trident: "삼지창",
}

export default function EnchantsPage() {
  const byCategory = ENCHANTS.reduce<Record<string, typeof ENCHANTS>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = []
    acc[e.category].push(e)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-2">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">인챈트 가이드</h1>
        <p className="text-sm text-foreground-muted leading-relaxed max-w-xl">
          인챈트 테이블 또는 모루를 이용해 아이템을 강화하세요. 일부 인챈트는 서로 호환되지 않습니다.
        </p>
      </div>
      {Object.entries(byCategory).map(([cat, enchants]) => (
        <section key={cat} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold tracking-tight">{categoryLabel[cat] ?? cat}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-foreground-muted font-medium">
              {enchants.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enchants.map((e) => (
              <Link
                key={e.id}
                href={`/enchants/${e.id}`}
                className="group p-4 rounded-lg border border-border bg-surface hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {e.nameKo}
                  </h3>
                  <span className="text-xs text-foreground-muted shrink-0 ml-2 tabular-nums">
                    Lv.{e.maxLevel}
                  </span>
                </div>
                {e.tradeOnly && (
                  <span className="text-xs px-1.5 py-0.5 rounded border border-border text-foreground-muted mb-2 inline-block">
                    보물
                  </span>
                )}
                <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">{e.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
