import { NextResponse } from 'next/server'

interface RateLimitTracker {
  count: number
  lastReset: number
}

// In-memory store. Note: In a serverless/edge environment (like Vercel),
// this memory will be scoped to the specific lambda instance. 
// For distributed strict rate limiting, consider migrating to @upstash/ratelimit.
const ipTracker = new Map<string, RateLimitTracker>()

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') || 'anonymous'
}

let lastCleanupAt = 0

function cleanupExpired(now: number, windowMs: number) {
  if (now - lastCleanupAt < 60000) return
  for (const [key, tracker] of ipTracker.entries()) {
    if (now - tracker.lastReset > windowMs * 2) {
      ipTracker.delete(key)
    }
  }
  lastCleanupAt = now
}

export function rateLimit(
  request: Request,
  limit: number = 100,
  windowMs: number = 60000,
  key: string = 'global'
) {
  const ip = getClientIp(request)
  const bucket = `${key}:${ip}`

  const now = Date.now()
  cleanupExpired(now, windowMs)
  let tracker = ipTracker.get(bucket)

  if (!tracker) {
    tracker = { count: 1, lastReset: now }
    ipTracker.set(bucket, tracker)
    return null // Allow request
  }

  // Reset window
  if (now - tracker.lastReset > windowMs) {
    tracker.count = 1
    tracker.lastReset = now
    ipTracker.set(bucket, tracker)
    return null // Allow request
  }

  // Increment count
  tracker.count++
  ipTracker.set(bucket, tracker)

  if (tracker.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later.' },
      { status: 429, headers: { 'Retry-After': Math.ceil(windowMs / 1000).toString() } }
    )
  }

  return null // Allow request
}
