import { getItems } from "@/lib/data/mc-items"
import ItemGrid from "@/components/items/ItemGrid"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "아이템 목록 — 마인크래프트 전체 아이템",
  description: "마인크래프트 1333개 아이템 전체 목록. 아이콘, 스택 크기, 내구도 확인.",
}

export default function ItemsPage() {
  const items = getItems()

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-2">Reference</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">아이템 목록</h1>
        <p className="text-sm text-foreground-muted leading-relaxed max-w-xl">
          마인크래프트의 모든 아이템을 검색하고 확인하세요.
        </p>
      </div>
      <ItemGrid items={items} />
    </div>
  )
}
