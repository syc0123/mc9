'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Database } from '@/lib/supabase/types'

type MarkerRow = Database['public']['Tables']['markers']['Row']
type WorkspaceRow = Database['public']['Tables']['workspaces']['Row']

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p>맵 로딩 중...</p>
      </div>
    </div>
  ),
})

const MarkerForm = dynamic(() => import('@/components/map/MarkerForm'), { ssr: false })

export default function MapPage() {
  const params = useParams<{ serverId: string }>()
  const serverId = params.serverId
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null)
  const [markers, setMarkers] = useState<MarkerRow[]>([])
  const [clickedPos, setClickedPos] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showOnlyPublic, setShowOnlyPublic] = useState(false)
  const displayedMarkers = showOnlyPublic ? markers.filter(m => m.is_public) : markers

  async function fetchWorkspace() {
    const res = await fetch('/api/servers')
    if (!res.ok) { setError('서버 정보를 불러올 수 없습니다.'); return }
    const servers: WorkspaceRow[] = await res.json()
    const ws = servers.find(s => s.id === serverId)
    if (!ws) { setError('서버를 찾을 수 없습니다.'); return }
    setWorkspace(ws)
  }

  const fetchMarkers = useCallback(async () => {
    const res = await fetch(`/api/markers?workspace_id=${serverId}`)
    if (res.ok) setMarkers(await res.json())
  }, [serverId])

  useEffect(() => {
    Promise.all([fetchWorkspace(), fetchMarkers()]).finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId])

  const handleMarkerDelete = useCallback(async (markerId: string) => {
    await fetch(`/api/markers/${markerId}`, { method: 'DELETE' })
    setMarkers(prev => prev.filter(m => m.id !== markerId))
  }, [])

  const handleMarkerSuccess = useCallback(() => {
    setClickedPos(null)
    fetchMarkers()
  }, [fetchMarkers])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4">⛏️</div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/servers" className="text-green-600 hover:underline">서버 목록으로</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/servers" className="text-sm text-gray-500 hover:text-green-600">
            ← 서버 목록
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="font-semibold">{workspace?.name}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>마커 {markers.length}개</span>
          <button
            onClick={() => setShowOnlyPublic(prev => !prev)}
            className={`px-3 py-1.5 border rounded-lg text-xs transition-colors ${showOnlyPublic ? 'bg-green-50 border-green-400 text-green-700' : 'hover:bg-gray-50'}`}
          >
            {showOnlyPublic ? '🌍 공유만' : '전체 마커'}
          </button>
          {clickedPos ? (
            <button
              onClick={() => setClickedPos(null)}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
          ) : (
            <span className="text-xs text-gray-400">지도를 클릭해 마커 추가</span>
          )}
        </div>
      </header>

      <div className="flex-1 relative">
        {workspace && (
          <MapView
            dynmapUrl={workspace.dynmap_url}
            markers={displayedMarkers}
            onMapClick={(lat, lng) => setClickedPos({ lat, lng })}
            onMarkerDelete={handleMarkerDelete}
          />
        )}
        {clickedPos && (
          <MarkerForm
            lat={clickedPos.lat}
            lng={clickedPos.lng}
            workspaceId={serverId}
            onSuccess={handleMarkerSuccess}
            onCancel={() => setClickedPos(null)}
          />
        )}
      </div>
    </div>
  )
}
