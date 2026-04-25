'use client'

type Props = {
  color: string
  size?: number
  variant?: 'splash' | 'lingering'
}

export function PotionIcon({ color, size = 56, variant }: Props) {
  const icon =
    variant === 'splash'
      ? 'splash_potion'
      : variant === 'lingering'
        ? 'lingering_potion'
        : 'potion'

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${color}60 0%, ${color}25 55%, transparent 80%)`,
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
          filter: `drop-shadow(0 2px 10px ${color}90)`,
        }}
      />
    </div>
  )
}
