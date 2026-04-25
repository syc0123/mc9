'use client'

type Props = {
  color: string
  size?: number
}

/** Minecraft 픽셀아트 스타일 포션 병 SVG. 액체 영역에 color를 직접 채색. */
export function PotionIcon({ color, size = 56 }: Props) {
  const o = '#1c1311'       // outline (dark)
  const cork1 = '#8B6319'   // cork light
  const cork2 = '#5C3D0B'   // cork dark
  const hl = 'rgba(255,255,255,0.42)'  // glass highlight

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 40% 35%, ${color}50 0%, ${color}20 60%, transparent 85%)`,
        }}
      />
      <svg
        width={size * 0.72}
        height={size * 0.72}
        viewBox="0 0 16 20"
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      >
        {/* ── 코르크 ── */}
        <rect x="6" y="0" width="4" height="1" fill={cork2} />
        <rect x="5" y="1" width="6" height="1" fill={cork1} />
        <rect x="5" y="2" width="6" height="1" fill={cork2} />

        {/* ── 목 (neck) ── */}
        <rect x="5" y="3" width="1" height="3" fill={o} />
        <rect x="10" y="3" width="1" height="3" fill={o} />
        <rect x="6" y="3" width="4" height="3" fill={color} />
        {/* neck highlight */}
        <rect x="6" y="3" width="1" height="3" fill={hl} />

        {/* ── 어깨 (shoulder) ── */}
        <rect x="3" y="6" width="1" height="1" fill={o} />
        <rect x="12" y="6" width="1" height="1" fill={o} />
        <rect x="4" y="6" width="8" height="1" fill={color} />

        {/* ── 몸통 (body) 외곽선 ── */}
        <rect x="2" y="7" width="1" height="8" fill={o} />
        <rect x="13" y="7" width="1" height="8" fill={o} />

        {/* ── 몸통 액체 ── */}
        <rect x="3" y="7" width="10" height="8" fill={color} />

        {/* ── 몸통 유리 하이라이트 ── */}
        <rect x="3" y="7" width="2" height="6" fill={hl} />
        <rect x="3" y="13" width="1" height="1" fill={hl} />

        {/* ── 바닥 라운딩 ── */}
        <rect x="3" y="15" width="10" height="1" fill={o} />
        <rect x="4" y="15" width="8" height="1" fill={color} />
        <rect x="4" y="16" width="8" height="1" fill={o} />
        <rect x="5" y="17" width="6" height="1" fill={color} />
        <rect x="5" y="18" width="6" height="1" fill={o} />
      </svg>
    </div>
  )
}
