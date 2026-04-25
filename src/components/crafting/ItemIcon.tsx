'use client'

import type { McItem } from '@/lib/data/mc-items'

type Props = {
  name: string | null
  itemMap: Map<string, McItem>
  size?: number
}

/** Render a single Minecraft item icon with text fallback. */
export function ItemIcon({ name, itemMap, size = 32 }: Props) {
  if (!name) return <div style={{ width: size, height: size }} />
  const item = itemMap.get(name)
  if (!item) {
    return (
      <div
        className="flex items-center justify-center text-[8px] text-foreground-muted bg-surface border border-border rounded"
        style={{ width: size, height: size }}
      >
        {name.slice(0, 5)}
      </div>
    )
  }
  return (
    <img
      src={item.iconUrl}
      alt={item.displayName}
      width={size}
      height={size}
      className="object-contain"
      style={{ imageRendering: 'pixelated', width: size, height: size }}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
