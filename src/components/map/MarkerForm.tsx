'use client'
import { useState } from 'react'

type Props = {
  lat: number
  lng: number
  workspaceId: string
  onSuccess: () => void
  onCancel: () => void
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

export default function MarkerForm({ lat, lng, workspaceId, onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#22c55e')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/markers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspace_id: workspaceId,
        title,
        description,
        lat,
        lng,
        color,
        is_public: isPublic,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '오류가 발생했습니다.')
      setLoading(false)
      return
    }
    onSuccess()
  }

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-xl shadow-lg border p-5 w-72">
      <h3 className="font-semibold mb-4">마커 추가</h3>
      <p className="text-xs text-gray-500 mb-4">
        좌표: {lat.toFixed(2)}, {lng.toFixed(2)}
      </p>
      {error && (
        <div className="mb-3 p-2 rounded bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          maxLength={100}
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="마커 이름 (최대 100자)"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <textarea
          maxLength={500}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="설명 (선택, 최대 500자)"
          rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        <div>
          <p className="text-xs text-gray-500 mb-1.5">색상</p>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'scale-125 border-gray-800' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">팀과 공유</span>
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}
