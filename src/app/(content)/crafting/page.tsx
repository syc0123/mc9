import { getItems, getRecipes, SUPPORTED_VERSIONS, DEFAULT_VERSION } from '@/lib/data/mc-items'
import { CraftingEncyclopedia } from '@/components/crafting/CraftingEncyclopedia'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '아이템 사전 — 마인크래프트 크래프팅 백과',
  description: '버전별 모든 아이템과 조합법. JEI 스타일로 재료를 타고 조합법 탐색.',
}

export default function CraftingPage() {
  const items = getItems(DEFAULT_VERSION)
  const recipes = getRecipes(DEFAULT_VERSION)
  return (
    <CraftingEncyclopedia
      initialItems={items}
      initialRecipes={recipes}
      initialVersion={DEFAULT_VERSION}
      versions={[...SUPPORTED_VERSIONS]}
    />
  )
}
