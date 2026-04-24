import Link from "next/link"
import { POTIONS } from "@/lib/data/potions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "포션 사전 — 모든 마인크래프트 포션 조합법",
  description:
    "마인크래프트의 모든 포션 조합법, 재료, 효과를 한눈에. 치유, 재생, 힘, 속도 등 Java & Bedrock 버전별 정리.",
}

export default function PotionsPage() {
  const byType = {
    positive: POTIONS.filter((p) => p.type === "positive"),
    negative: POTIONS.filter((p) => p.type === "negative"),
    mixed: POTIONS.filter((p) => p.type === "mixed"),
  }

  const typeLabel: Record<string, string> = {
    positive: "긍정 효과",
    negative: "부정 효과",
    mixed: "복합 효과",
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-3">포션 사전</h1>
      <p className="text-gray-600 mb-8">
        마인크래프트의 모든 포션 조합법과 효과를 정리했습니다. 양조대에서 물약 병 + 재료로 제작하세요.
      </p>

      {(Object.entries(byType) as [string, typeof POTIONS][]).map(
        ([type, potions]) =>
          potions.length > 0 && (
            <section key={type} className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">{typeLabel[type]}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {potions.map((potion) => (
                  <Link
                    key={potion.id}
                    href={`/potions/${potion.id}`}
                    className="p-4 rounded-xl border hover:border-green-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold group-hover:text-green-600 transition-colors">
                        {potion.nameKo}
                      </h3>
                      {potion.edition !== "both" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {potion.edition}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{potion.baseIngredient}</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{potion.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          )
      )}
    </div>
  )
}
