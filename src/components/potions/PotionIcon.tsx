'use client'

import { useState } from 'react'

type Props = {
  color: string
  size?: number
}

/** 실제 Minecraft potion.png + potion_overlay.png 합성 아이콘.
 *  로드 실패 시 SVG 픽셀아트 병으로 fallback. */
export function PotionIcon({ color, size = 56 }: Props) {
  const hex = color.replace('#', '').toUpperCase()
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${color}45 0%, ${color}18 60%, transparent 85%)`,
        }}
      />
      {!failed ? (
        <img
          src={`/icons/1.21.4/potion_${hex}.png`}
          alt=""
          width={size * 0.82}
          height={size * 0.82}
          className="relative"
          style={{
            imageRendering: 'pixelated',
            filter: `drop-shadow(0 2px 8px ${color}80)`,
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <FallbackSVG color={color} size={size * 0.72} />
      )}
    </div>
  )
}

function FallbackSVG({ color, size }: { color: string; size: number }) {
  const o = '#1c1311'
  const cork1 = '#8B6319'
  const cork2 = '#5C3D0B'
  const hl = 'rgba(255,255,255,0.42)'
  return (
    <svg width={size} height={size} viewBox="0 0 16 20"
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}>
      <rect x="6" y="0" width="4" height="1" fill={cork2} />
      <rect x="5" y="1" width="6" height="1" fill={cork1} />
      <rect x="5" y="2" width="6" height="1" fill={cork2} />
      <rect x="5" y="3" width="1" height="3" fill={o} />
      <rect x="10" y="3" width="1" height="3" fill={o} />
      <rect x="6" y="3" width="4" height="3" fill={color} />
      <rect x="6" y="3" width="1" height="3" fill={hl} />
      <rect x="3" y="6" width="1" height="1" fill={o} />
      <rect x="12" y="6" width="1" height="1" fill={o} />
      <rect x="4" y="6" width="8" height="1" fill={color} />
      <rect x="2" y="7" width="1" height="8" fill={o} />
      <rect x="13" y="7" width="1" height="8" fill={o} />
      <rect x="3" y="7" width="10" height="8" fill={color} />
      <rect x="3" y="7" width="2" height="6" fill={hl} />
      <rect x="3" y="13" width="1" height="1" fill={hl} />
      <rect x="3" y="15" width="10" height="1" fill={o} />
      <rect x="4" y="15" width="8" height="1" fill={color} />
      <rect x="4" y="16" width="8" height="1" fill={o} />
      <rect x="5" y="17" width="6" height="1" fill={color} />
      <rect x="5" y="18" width="6" height="1" fill={o} />
    </svg>
  )
}
