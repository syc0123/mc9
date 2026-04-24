import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { checkRateLimit, checkTileRateLimit } from '@/lib/security/rateLimit'
import { validatePublicUrl } from '@/lib/security/ssrf'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tileUrl = searchParams.get('url')

  if (!tileUrl) return NextResponse.json({ error: 'url required' }, { status: 400 })

  // Per-user inbound rate limit (prevents Upstash DoS via hostname cycling)
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const rateLimitKey = user?.id ?? request.headers.get('x-forwarded-for') ?? 'anon'
  const inbound = await checkRateLimit(rateLimitKey)
  if (!inbound.success) {
    return NextResponse.json(
      { error: '요청 한도 초과. 잠시 후 다시 시도하세요.' },
      {
        status: 429,
        headers: inbound.retryAfter
          ? { 'Retry-After': String(inbound.retryAfter) }
          : {},
      }
    )
  }

  // SSRF validation — returns pre-resolved IP to close TOCTOU gap
  const urlCheck = await validatePublicUrl(tileUrl)
  if (!urlCheck.valid) {
    return NextResponse.json({ error: urlCheck.reason }, { status: 400 })
  }

  const { resolvedIp, parsed } = urlCheck

  // Per-host outbound rate limit
  const rl = await checkTileRateLimit(parsed.hostname)
  if (!rl.success) {
    return NextResponse.json(
      { error: '타일 요청 한도 초과. 잠시 후 다시 시도하세요.' },
      { status: 503 }
    )
  }

  // Fetch via pre-resolved IP — eliminates DNS rebinding TOCTOU window
  const fetchUrl = new URL(tileUrl)
  fetchUrl.hostname = resolvedIp

  try {
    const res = await fetch(fetchUrl.toString(), {
      signal: AbortSignal.timeout(8000),
      headers: {
        Host: parsed.hostname,  // required for SNI and virtual hosting
      },
    })
    if (!res.ok) {
      return new Response(null, { status: 204 })
    }
    const contentType = res.headers.get('content-type') ?? 'image/png'
    const buffer = await res.arrayBuffer()
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response(null, { status: 204 })
  }
}
