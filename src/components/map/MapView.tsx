'use client'
import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { Database } from '@/lib/supabase/types'

type MarkerRow = Database['public']['Tables']['markers']['Row']

type Props = {
  dynmapUrl: string
  markers: MarkerRow[]
  onMapClick?: (lat: number, lng: number) => void
  onMarkerDelete?: (markerId: string) => void
}

export default function MapView({ dynmapUrl, markers, onMapClick, onMarkerDelete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerLayerRef = useRef<Map<string, any>>(new Map())
  const [corsError, setCorsError] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(containerRef.current!, {
        center: [0, 0],
        zoom: 2,
        minZoom: 0,
        maxZoom: 8,
        crs: L.CRS.Simple,
      })

      mapRef.current = map

      const directUrl = `${dynmapUrl}/tiles/{z}/{x}_{y}.png`
      const proxyUrl = `/api/tiles?url=${encodeURIComponent(dynmapUrl)}/tiles/{z}/{x}_{y}.png`

      const tileLayer = L.tileLayer(directUrl, {
        tileSize: 128,
        noWrap: true,
        errorTileUrl: '',
      })

      tileLayer.on('tileerror', () => {
        setCorsError(prev => {
          if (!prev) {
            map.removeLayer(tileLayer)
            L.tileLayer(proxyUrl, { tileSize: 128, noWrap: true }).addTo(map)
            return true
          }
          return prev
        })
      })

      tileLayer.addTo(map)

      map.on('click', (e) => {
        onMapClick?.(e.latlng.lat, e.latlng.lng)
      })
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynmapUrl])

  useEffect(() => {
    async function syncMarkers() {
      if (!mapRef.current) return
      const L = (await import('leaflet')).default

      markerLayerRef.current.forEach(m => m.remove())
      markerLayerRef.current.clear()

      markers.forEach(marker => {
        const m = L.circleMarker([marker.lat, marker.lng], {
          radius: 8,
          fillColor: marker.color,
          color: '#fff',
          weight: 2,
          fillOpacity: 0.9,
        })

        // Build popup via DOM (never innerHTML) — XSS safe
        const container = document.createElement('div')
        container.style.minWidth = '180px'

        const title = document.createElement('strong')
        title.style.fontSize = '14px'
        title.textContent = marker.title
        container.appendChild(title)

        if (marker.description) {
          const desc = document.createElement('p')
          desc.style.cssText = 'margin:6px 0;font-size:12px;color:#666'
          desc.textContent = marker.description
          container.appendChild(desc)
        }

        const footer = document.createElement('div')
        footer.style.cssText = 'display:flex;gap:8px;margin-top:8px;align-items:center'

        const badge = document.createElement('span')
        badge.style.fontSize = '11px'
        badge.style.color = marker.is_public ? '#22c55e' : '#999'
        badge.textContent = marker.is_public ? '🌍 공유' : '🔒 개인'
        footer.appendChild(badge)

        if (onMarkerDelete) {
          const deleteBtn = document.createElement('button')
          deleteBtn.textContent = '삭제'
          deleteBtn.style.cssText = 'font-size:11px;color:#ef4444;cursor:pointer;background:none;border:none;padding:0;margin-left:auto'
          deleteBtn.addEventListener('click', () => {
            onMarkerDelete(marker.id)
            m.closePopup()
          })
          footer.appendChild(deleteBtn)
        }

        container.appendChild(footer)
        m.bindPopup(container)

        m.addTo(mapRef.current!)
        markerLayerRef.current.set(marker.id, m)
      })
    }
    syncMarkers()
  }, [markers, onMarkerDelete])

  return (
    <div className="relative w-full h-full">
      {corsError && (
        <div className="absolute top-2 left-2 z-[1000] text-xs bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-1.5 rounded-lg">
          서버 사이드 프록시로 전환됨 (CORS 설정 확인 권장)
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
