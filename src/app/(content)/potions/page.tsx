import { BrewingGuide } from '@/components/potions/BrewingGuide'
import { PotionList } from '@/components/potions/PotionList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '포션 사전 — 모든 마인크래프트 포션 조합법',
  description:
    '마인크래프트의 모든 포션 조합법, 재료, 효과를 한눈에. 치유, 재생, 힘, 속도 등 Java & Bedrock 버전별 정리.',
}

export default function PotionsPage() {
  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-2">
          Reference
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">포션 사전</h1>
        <p className="text-sm text-foreground-muted leading-relaxed max-w-xl">
          양조대에서 만들 수 있는 모든 물약의 재료와 효과를 정리했습니다.
          Java Edition과 Bedrock Edition을 모두 지원합니다.
        </p>
      </div>

      {/* 양조 기초 가이드 */}
      <BrewingGuide />

      {/* 포션 목록 (검색 + 필터 포함) */}
      <PotionList />
    </div>
  )
}
