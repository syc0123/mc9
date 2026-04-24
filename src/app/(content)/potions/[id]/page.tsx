import { POTIONS } from "@/lib/data/potions"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return POTIONS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const potion = POTIONS.find((p) => p.id === id)
  if (!potion) return { title: "포션을 찾을 수 없습니다" }
  return {
    title: `${potion.nameKo} 조합법 — MC9 포션 사전`,
    description: potion.description,
  }
}

export default async function PotionDetailPage({ params }: Props) {
  const { id } = await params
  const potion = POTIONS.find((p) => p.id === id)
  if (!potion) notFound()

  const typeColors: Record<string, string> = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800",
    mixed: "bg-yellow-100 text-yellow-800",
  }

  const typeLabel: Record<string, string> = {
    positive: "긍정",
    negative: "부정",
    mixed: "복합",
  }

  const editionLabel =
    potion.edition === "both"
      ? "Java & Bedrock"
      : potion.edition === "java"
        ? "Java Edition"
        : "Bedrock Edition"

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/potions" className="text-sm text-gray-500 hover:text-green-600 mb-6 inline-block">
        뒤로
      </Link>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">{potion.nameKo}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${typeColors[potion.type]}`}>
          {typeLabel[potion.type]}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-6">{potion.name}</p>
      <p className="text-gray-700 mb-8 text-lg">{potion.description}</p>

      <div className="space-y-6">
        <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
          <h2 className="font-semibold mb-3 text-amber-800">기본 재료</h2>
          <p className="text-amber-900 font-medium">{potion.baseIngredient}</p>
        </div>

        {potion.modifiers.length > 0 && (
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
            <h2 className="font-semibold mb-3 text-blue-800">변형 재료</h2>
            <ul className="space-y-1">
              {potion.modifiers.map((mod, i) => (
                <li key={i} className="text-blue-900">
                  {mod}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-6 rounded-xl bg-purple-50 border border-purple-200">
          <h2 className="font-semibold mb-3 text-purple-800">효과</h2>
          {potion.effects.map((effect, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-purple-900">{effect.name}</span>
              <div className="text-right text-sm text-purple-700">
                {effect.duration && <span className="mr-3">{effect.duration}</span>}
                {effect.amplifier && <span>+{effect.amplifier} HP</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-gray-100 text-sm text-gray-600">
          지원 버전: {editionLabel}
        </div>
      </div>
    </div>
  )
}
