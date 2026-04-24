import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let ratelimit: Ratelimit | null = null

// Lazily initializes the shared rate limiter (20 req/min per identifier)
function getRatelimit(): Ratelimit | null {
  if (
    !ratelimit &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(20, '1 m'),
    })
  }
  return ratelimit
}

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; retryAfter?: number }> {
  const rl = getRatelimit()
  if (!rl) return { success: true } // Redis not configured — allow through

  const { success, reset } = await rl.limit(identifier)
  if (!success) {
    return {
      success: false,
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    }
  }
  return { success: true }
}

// Tile proxy rate limit: 60 tile requests per minute per host
export async function checkTileRateLimit(
  host: string
): Promise<{ success: boolean }> {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return { success: true }
  }

  const tileLimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'tile',
  })

  const { success } = await tileLimit.limit(`host:${host}`)
  return { success }
}
