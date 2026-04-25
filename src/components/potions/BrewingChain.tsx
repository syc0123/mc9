import { IngredientIcon } from './IngredientIcon'
import { PotionIcon } from './PotionIcon'
import type { Potion } from '@/lib/data/potions'

export function BrewingChain({ potion: p }: { potion: Potion }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <BrewingStep icon="glass_bottle" label="유리 병" sub="물 추가" />
      <Arrow />
      <BrewingStep icon="nether_wart" label="네더 사마귀" sub="어색한 물약" highlight />
      <Arrow />
      <BrewingStep icon={p.baseIngredientIcon} label={p.baseIngredient} sub="기본 재료" />
      <Arrow />
      <div className="flex flex-col items-center gap-1">
        <PotionIcon color={p.color} size={44} />
        <span className="text-xs font-semibold text-center leading-tight max-w-[72px]">
          {p.nameKo}
        </span>
      </div>
    </div>
  )
}

export function PotionVariants({ potion: p }: { potion: Potion }) {
  if (!p.canExtend && !p.canAmplify) return null
  return (
    <div className="flex flex-wrap gap-3">
      {p.canExtend && (
        <ModifierCard icon="redstone" name="레드스톤 먼지" effect="지속시간 연장 (8분)" />
      )}
      {p.canAmplify && (
        <ModifierCard icon="glowstone_dust" name="형광석 가루" effect="효과 강화 (II)" />
      )}
    </div>
  )
}

export function PotionForms({ color }: { color: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <FormCard
        icon="splash_potion"
        color={color}
        name="투척용 물약"
        modIcon="gunpowder"
        modLabel="화약 추가"
      />
      <FormCard
        icon="lingering_potion"
        color={color}
        name="잔류형 물약"
        modIcon="dragon_breath"
        modLabel="용의 숨결 추가"
      />
    </div>
  )
}

function BrewingStep({
  icon, label, sub, highlight,
}: {
  icon: string; label: string; sub: string; highlight?: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border ${
      highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
    }`}>
      <IngredientIcon iconKey={icon} size={28} />
      <span className="text-[11px] font-medium leading-tight text-center max-w-[64px]">{label}</span>
      <span className={`text-[10px] leading-none ${highlight ? 'text-primary' : 'text-foreground-muted'}`}>
        {sub}
      </span>
    </div>
  )
}

function ModifierCard({ icon, name, effect }: { icon: string; name: string; effect: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background">
      <IngredientIcon iconKey={icon} size={24} />
      <div>
        <div className="text-xs font-semibold mb-0.5">{name}</div>
        <div className="text-[11px] text-foreground-muted">{effect}</div>
      </div>
    </div>
  )
}

function FormCard({
  icon, color, name, modIcon, modLabel,
}: {
  icon: string; color: string; name: string; modIcon: string; modLabel: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-background">
      <img
        src={`/icons/1.21.4/${icon}.png`}
        width={28} height={28}
        style={{ imageRendering: 'pixelated', filter: `drop-shadow(0 1px 6px ${color}80)` }}
        alt=""
      />
      <div>
        <div className="text-xs font-semibold mb-1">{name}</div>
        <div className="flex items-center gap-1.5">
          <IngredientIcon iconKey={modIcon} size={14} />
          <span className="text-[11px] text-foreground-muted">{modLabel}</span>
        </div>
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="text-foreground-muted shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
