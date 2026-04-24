import { ENCHANTS } from "@/lib/data/enchants"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return ENCHANTS.map((e) => ({ id: e.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const e = ENCHANTS.find((e) => e.id === id)
  if (!e) return { title: "인챈트를 찾을 수 없습니다" }
  return { title: `${e.nameKo} 인챈트 — MC9`, description: e.description }
}

export default async function EnchantDetailPage({ params }: Props) {
  const { id } = await params
  const enchant = ENCHANTS.find((e) => e.id === id)
  if (!enchant) notFound()

  const editionLabel =
    enchant.edition === "both" ? "Java & Bedrock" : enchant.edition

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/enchants"
        className="text-sm text-gray-500 hover:text-green-600 mb-6 inline-block"
      >
        뒤로
      </Link>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">{enchant.nameKo}</h1>
        {enchant.tradeOnly && (
          <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-medium">
            보물 인챈트
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-2">{enchant.name}</p>
      <p className="text-gray-500 text-sm mb-6">
        최대 {enchant.maxLevel}레벨 | {editionLabel}
      </p>
      <p className="text-gray-700 mb-8 text-lg">{enchant.description}</p>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">레벨</th>
                <th className="text-left px-4 py-3 font-medium">효과</th>
              </tr>
            </thead>
            <tbody>
              {enchant.levels.map((lvl, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3 font-mono font-medium text-green-700">{lvl.roman}</td>
                  <td className="px-4 py-3 text-gray-700">{lvl.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {enchant.incompatible.length > 0 && (
          <div className="p-5 rounded-xl bg-red-50 border border-red-200">
            <h2 className="font-semibold mb-2 text-red-800">호환 불가</h2>
            <div className="flex flex-wrap gap-2">
              {enchant.incompatible.map((incId) => {
                const inc = ENCHANTS.find((e) => e.id === incId)
                return (
                  <Link
                    key={incId}
                    href={`/enchants/${incId}`}
                    className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm hover:bg-red-200 transition-colors"
                  >
                    {inc?.nameKo ?? incId}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
