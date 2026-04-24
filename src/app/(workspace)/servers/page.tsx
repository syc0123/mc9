import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '내 서버 목록 — MC9' }

export default async function ServersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*, workspace_members!inner(role)')
    .eq('workspace_members.user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">내 서버</h1>
            <p className="text-gray-500 mt-1">등록된 마인크래프트 서버 목록</p>
          </div>
          <Link
            href="/servers/new"
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            + 서버 등록
          </Link>
        </div>

        {!workspaces || workspaces.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <p className="text-5xl mb-4">🗺️</p>
            <h2 className="text-xl font-semibold mb-2">등록된 서버가 없습니다</h2>
            <p className="text-gray-500 mb-6">
              마인크래프트 서버를 등록하고 Dynmap 맵을 팀과 공유하세요.
            </p>
            <Link
              href="/servers/new"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              첫 서버 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {workspaces.map(ws => {
              const members = ws.workspace_members as { role: string }[]
              const role = members[0]?.role
              return (
                <Link
                  key={ws.id}
                  href={`/servers/${ws.id}/map`}
                  className="p-5 rounded-xl border hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                      {ws.name}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      role === 'admin'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {role === 'admin' ? '관리자' : '멤버'}
                    </span>
                  </div>
                  {ws.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ws.description}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate">{ws.dynmap_url}</p>
                </Link>
              )
            })}
          </div>
        )}
    </main>
  )
}
