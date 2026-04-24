import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  sanitizeMarkerTitle,
  sanitizeMarkerDescription,
  validateCoordinates,
} from '@/lib/security/sanitize'
import { checkRateLimit } from '@/lib/security/rateLimit'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workspaceId = searchParams.get('workspace_id')
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('markers')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = await checkRateLimit(`marker-create:${user.id}`)
  if (!rl.success) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 })
  }

  const body = await request.json()
  const title = sanitizeMarkerTitle(body.title ?? '')
  const description = sanitizeMarkerDescription(body.description ?? '')
  const { workspace_id, lat, lng, color = '#22c55e', icon = 'default', is_public = false } = body

  if (!title) {
    return NextResponse.json({ error: '마커 제목은 필수입니다.' }, { status: 400 })
  }
  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 })
  }
  if (!validateCoordinates(Number(lat), Number(lng))) {
    return NextResponse.json({ error: '유효하지 않은 좌표입니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('markers')
    .insert({
      workspace_id,
      user_id: user.id,
      title,
      description,
      lat: Number(lat),
      lng: Number(lng),
      color,
      icon,
      is_public,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
