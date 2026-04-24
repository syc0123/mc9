import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sanitizeWorkspaceName, sanitizeMarkerDescription } from '@/lib/security/sanitize'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { validatePublicUrl } from '@/lib/security/ssrf'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('workspaces')
    .select('*, workspace_members!inner(role)')
    .eq('workspace_members.user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await checkRateLimit(`server-create:${user.id}`)
  if (!rl.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
    )
  }

  const body = await request.json()
  const name = sanitizeWorkspaceName(body.name ?? '')
  const description = sanitizeMarkerDescription(body.description ?? '')
  const dynmapUrl = (body.dynmap_url ?? '').trim().replace(/\/$/, '')

  if (!name || !dynmapUrl) {
    return NextResponse.json({ error: '이름과 Dynmap URL은 필수입니다.' }, { status: 400 })
  }

  const urlCheck = await validatePublicUrl(dynmapUrl)
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.reason ?? '유효하지 않은 URL입니다.' }, { status: 400 })
  }

  // Dynmap endpoint validation
  const tilePathPattern = '/tiles/{world}/flat/'
  let validated = false
  const endpoints = ['/up/world/world/0', '/tiles/world/flat/', '/dynmap_config.json']
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${dynmapUrl}${ep}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        validated = true
        break
      }
    } catch {
      // try next endpoint
    }
  }
  if (!validated) {
    return NextResponse.json(
      { error: '유효한 Dynmap 서버를 찾을 수 없습니다. 서버가 온라인 상태이고 공개 Dynmap인지 확인해주세요.' },
      { status: 422 }
    )
  }

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({ name, description, dynmap_url: dynmapUrl, tile_path_pattern: tilePathPattern, owner_id: user.id })
    .select()
    .single()

  if (wsError) return NextResponse.json({ error: wsError.message }, { status: 500 })

  // Add owner as admin member
  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'admin',
    joined_at: new Date().toISOString(),
  })

  return NextResponse.json(workspace, { status: 201 })
}
