import { promises as dns } from 'dns'

const PRIVATE_RANGES = [
  /^127\./,                          // loopback
  /^10\./,                           // 10.x.x.x
  /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16-31.x.x
  /^192\.168\./,                     // 192.168.x.x
  /^169\.254\./,                     // link-local (AWS metadata)
  /^::1$/,                           // IPv6 loopback
  /^fc00:/,                          // IPv6 private
  /^fe80:/,                          // IPv6 link-local
]

function isPrivate(addr: string): boolean {
  return PRIVATE_RANGES.some(re => re.test(addr))
}

export type UrlValidationResult =
  | { valid: false; reason: string }
  | { valid: true; resolvedIp: string; parsed: URL }

/**
 * Validates a URL against SSRF attack vectors.
 * Returns the pre-resolved IP so callers can fetch via IP + Host header,
 * eliminating the TOCTOU window between DNS check and actual request.
 */
export async function validatePublicUrl(urlStr: string): Promise<UrlValidationResult> {
  let parsed: URL
  try {
    parsed = new URL(urlStr)
  } catch {
    return { valid: false, reason: '유효한 URL이 아닙니다.' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'HTTP 또는 HTTPS URL만 허용됩니다.' }
  }

  const hostname = parsed.hostname

  // Block direct private IP input
  if (isPrivate(hostname)) {
    return { valid: false, reason: '내부 네트워크 주소는 허용되지 않습니다.' }
  }

  // Resolve both IPv4 and IPv6 and validate all resolved addresses
  const v4 = await dns.resolve4(hostname).catch(() => [] as string[])
  const v6 = await dns.resolve6(hostname).catch(() => [] as string[])
  const all = [...v4, ...v6]

  if (all.length === 0) {
    return { valid: false, reason: 'DNS 조회에 실패했습니다.' }
  }

  for (const addr of all) {
    if (isPrivate(addr)) {
      return { valid: false, reason: '내부 네트워크로 해석되는 주소는 허용되지 않습니다.' }
    }
  }

  // Return first resolved public IP — caller uses this for fetch to close TOCTOU gap
  return { valid: true, resolvedIp: v4[0] ?? v6[0], parsed }
}
