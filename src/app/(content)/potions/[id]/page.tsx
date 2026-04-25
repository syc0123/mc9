import { POTIONS } from '@/lib/data/potions'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PotionIcon } from '@/components/potions/PotionIcon'
import { BrewingChain, PotionVariants, PotionForms } from '@/components/potions/BrewingChain'

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return POTIONS.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const p = POTIONS.find((p) => p.id === id)
  if (!p) return { title: '포션을 찾을 수 없습니다' }
  return {
    title: `${p.nameKo} 조합법 — MC9 포션 사전`,
    description: p.description,
  }
}

const TYPE_STYLE = {
  positive: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    label: '긍정 효과',
    section: 'bg-emerald-500/5 border-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  negative: {
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    label: '부정 효과',
    section: 'bg-destructive/5 border-destructive/15',
    text: 'text-destructive',
  },
  mixed: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    label: '복합 효과',
    section: 'bg-amber-500/5 border-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
  },
}

export default async function PotionDetailPage({ params }: Props) {
  const { id } = await params
  const p = POTIONS.find((p) => p.id === id)
  if (!p) notFound()

  const style = TYPE_STYLE[p.type]
  const editionLabel =
    p.edition === 'both'
      ? 'Java & Bedrock'
      : p.edition === 'java'
        ? 'Java Edition'
        : 'Bedrock Edition'

  return (
    <div className="max-w-2xl mx-auto">
      {/* 뒤로 */}
      <Link
        href="/potions"
        className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-primary transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        포션 사전
      </Link>

      {/* 헤더 */}
      <div className="flex items-start gap-5 mb-6">
        <PotionIcon color={p.color} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{p.nameKo}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${style.badge}`}>
              {style.label}
            </span>
            <span className="text-xs px-2 py-1 rounded border border-border text-foreground-muted font-medium">
              {editionLabel}
            </span>
          </div>
          <p className="text-sm text-foreground-muted mb-3">{p.name}</p>
          <p className="text-sm text-foreground leading-relaxed">{p.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 효과 */}
        <section className={`rounded-xl border p-5 ${style.section}`}>
          <h2 className={`text-xs font-semibold uppercase tracking-widest mb-3 ${style.text}`}>
            효과
          </h2>
          <div className="space-y-2">
            {p.effects.map((e, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium">{e.name}</span>
                <div className="flex items-center gap-3 text-sm text-foreground-muted">
                  {e.duration && <span>{e.duration}</span>}
                  {e.amplifier && (
                    <span className={`font-semibold ${style.text}`}>+{e.amplifier} HP</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 양조법 */}
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-4">
            양조법
          </h2>
          <BrewingChain potion={p} />
        </section>

        {/* 변형 */}
        {(p.canExtend || p.canAmplify) && (
          <section className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-4">
              변형
            </h2>
            <PotionVariants potion={p} />
          </section>
        )}

        {/* 다른 형태 */}
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-foreground-muted mb-4">
            다른 형태
          </h2>
          <PotionForms color={p.color} />
        </section>
      </div>
    </div>
  )
}
