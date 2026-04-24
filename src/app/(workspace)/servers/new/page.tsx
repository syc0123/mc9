'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewServerPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [dynmapUrl, setDynmapUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, dynmap_url: dynmapUrl }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '오류가 발생했습니다.')
      setLoading(false)
      return
    }
    router.push(`/servers/${data.id}/map`)
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-12">
        <Link href="/servers" className="text-sm text-gray-500 hover:text-green-600 mb-6 inline-block">
          ← 서버 목록
        </Link>
        <h1 className="text-3xl font-bold mb-8">서버 등록</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">서버 이름 *</label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 우리 생존 서버"
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">설명</label>
            <textarea
              rows={3}
              maxLength={500}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="서버에 대한 간략한 설명"
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Dynmap URL *</label>
            <input
              type="url"
              required
              value={dynmapUrl}
              onChange={e => setDynmapUrl(e.target.value)}
              placeholder="https://map.your-server.com"
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              공개 Dynmap URL을 입력하세요. 등록 시 자동으로 유효성 검증합니다.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <strong>CORS 설정 안내</strong><br />
            Dynmap 서버에서 CORS를 허용하지 않으면 타일 로딩이 서버를 경유합니다.
            Dynmap 설정 파일에 <code>allowsignedrequests: false</code>와 CORS 헤더를 추가하세요.
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '등록 중 (Dynmap 검증 최대 15초)...' : '서버 등록'}
          </button>
        </form>
    </main>
  )
}
