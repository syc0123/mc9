import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/supabase/types'
import {
  sanitizeMarkerTitle,
  sanitizeMarkerDescription,
  validateCoordinates,
} from '@/lib/security/sanitize'

type Params = { params: Promise<{ id: string }> }
type MarkerUpdate = Database['public']['Tables']['markers']['Update']

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: MarkerUpdate = { updated_at: new Date().toISOString() }

  if (body.title !== undefined) updates.title = sanitizeMarkerTitle(body.title)
  if (body.description !== undefined) updates.description = sanitizeMarkerDescription(body.description)
  if (body.color !== undefined) updates.color = body.color
  if (body.is_public !== undefined) updates.is_public = Boolean(body.is_public)
  if (body.lat !== undefined && body.lng !== undefined) {
    if (!validateCoordinates(Number(body.lat), Number(body.lng))) {
      return NextResponse.json({ error: '유효하지 않은 좌표입니다.' }, { status: 400 })
    }
    updates.lat = Number(body.lat)
    updates.lng = Number(body.lng)
  }

  const { data, error } = await supabase
    .from('markers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('markers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
