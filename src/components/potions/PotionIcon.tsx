'use client'

type Props = {
  color: string
  size?: number
  variant?: 'splash' | 'lingering'
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s: s * 100, l: l * 100 }
}

// sepia() 기준 hue ≈ 30° → target hue까지 회전
function getPotionFilter(hex: string): string {
  const { h, s, l } = hexToHsl(hex)
  const rotation = Math.round(h - 30)
  const saturate = s < 15 ? 0.6 : Math.max(2, s / 12)
  const brightness = l > 70 ? 1.4 : l < 25 ? 0.75 : 1.05
  return `sepia(1) hue-rotate(${rotation}deg) saturate(${saturate.toFixed(1)}) brightness(${brightness.toFixed(2)})`
}

export function PotionIcon({ color, size = 56, variant }: Props) {
  const icon =
    variant === 'splash'
      ? 'splash_potion'
      : variant === 'lingering'
        ? 'lingering_potion'
        : 'potion'

  const colorFilter = getPotionFilter(color)

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${color}45 0%, ${color}18 55%, transparent 80%)`,
        }}
      />
      <img
        src={`/icons/1.21.4/${icon}.png`}
        alt=""
        width={size}
        height={size}
        className="relative"
        style={{
          imageRendering: 'pixelated',
          filter: `${colorFilter} drop-shadow(0 2px 10px ${color}90)`,
        }}
      />
    </div>
  )
}
