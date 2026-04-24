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
      <h1 className="text-4xl font-bold mb-3">인챈트 가이드</h1>
      <p className="text-gray-600 mb-8">
        인챈트 테이블 또는 모루를 이용해 아이템을 강화하세요. 일부 인챈트는 서로 호환되지 않습니다.
      </p>
      {Object.entries(byCategory).map(([cat, enchants]) => (
        <section key={cat} className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">{categoryLabel[cat] ?? cat}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enchants.map((e) => (
              <Link
                key={e.id}
                href={`/enchants/${e.id}`}
                className="p-4 rounded-xl border hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-green-600 transition-colors">
                    {e.nameKo}
                  </h3>
                  <span className="text-xs font-mono text-gray-400">최대 {e.maxLevel}레벨</span>
                </div>
                {e.tradeOnly && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 mb-2 inline-block">
                    보물
                  </span>
                )}
                <p className="text-sm text-gray-700 line-clamp-2">{e.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
