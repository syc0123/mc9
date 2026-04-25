import { IngredientIcon } from './IngredientIcon'

const MODIFIERS = [
  { icon: 'redstone', label: '레드스톤', effect: '지속시간 연장' },
  { icon: 'glowstone_dust', label: '형광석 가루', effect: '효과 강화 (II)' },
  { icon: 'fermented_spider_eye', label: '발효된 거미 눈', effect: '효과 반전' },
  { icon: 'gunpowder', label: '화약', effect: '투척용 물약' },
  { icon: 'dragon_breath', label: '용의 숨결', effect: '잔류형 물약' },
]

const BREWING_CHAIN = [
  { icon: 'glass_bottle', label: '유리 병' },
  { icon: 'nether_wart', label: '네더 사마귀' },
  { icon: 'blaze_powder', label: '블레이즈 가루', note: '연료' },
]

export function BrewingGuide() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-4">
        양조 기초
      </p>

      {/* 기본 체인 */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background border border-border">
          <IngredientIcon iconKey="glass_bottle" size={20} />
          <span className="text-xs font-medium">유리 병 + 물</span>
        </div>
        <Arrow />
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-background border border-border">
          <IngredientIcon iconKey="nether_wart" size={20} />
          <span className="text-xs font-medium">네더 사마귀</span>
        </div>
        <Arrow />
        <div className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-xs font-semibold text-primary">어색한 물약</span>
        </div>
        <Arrow />
        <div className="px-3 py-2 rounded-lg bg-background border border-dashed border-foreground-muted/40">
          <span className="text-xs text-foreground-muted">+ 재료 → 효과 물약</span>
        </div>
      </div>

      {/* 연료 */}
      <div className="flex items-center gap-1.5 mb-4 text-xs text-foreground-muted">
        <IngredientIcon iconKey="blaze_powder" size={16} />
        <span>블레이즈 가루는 양조대의 연료로 사용됩니다.</span>
      </div>

      {/* 수정재 */}
      <div className="border-t border-border pt-4">
        <p className="text-xs text-foreground-muted mb-3">수정재 (완성된 물약에 추가)</p>
        <div className="flex flex-wrap gap-2">
          {MODIFIERS.map((m) => (
            <div
              key={m.icon}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border"
            >
              <IngredientIcon iconKey={m.icon} size={18} />
              <div>
                <div className="text-xs font-medium leading-none mb-0.5">{m.label}</div>
                <div className="text-[10px] text-foreground-muted leading-none">{m.effect}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="text-foreground-muted shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
