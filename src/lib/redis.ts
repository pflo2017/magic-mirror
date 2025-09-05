import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
})

redis.on('error', (error) => {
  console.error('Redis connection error:', error)
})

redis.on('connect', () => {
  console.log('Connected to Redis')
})

export default redis

// Cache helper functions
export const cacheOperations = {
  // Generate cache key for AI results
  generateCacheKey(styleId: string, imageHash: string): string {
    return `ai_result:${styleId}:${imageHash}`
  },

  // Store AI generation result in cache
  async cacheResult(styleId: string, imageHash: string, result: any, ttl: number = 3600): Promise<void> {
    const key = this.generateCacheKey(styleId, imageHash)
    await redis.setex(key, ttl, JSON.stringify(result))
  },

  // Get cached AI generation result
  async getCachedResult(styleId: string, imageHash: string): Promise<any | null> {
    const key = this.generateCacheKey(styleId, imageHash)
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  },

  // Store session data temporarily
  async storeSession(sessionId: string, sessionData: any, ttl: number = 7200): Promise<void> {
    const key = `session:${sessionId}`
    await redis.setex(key, ttl, JSON.stringify(sessionData))
  },

  // Get session data
  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  },

  // Remove session from cache
  async removeSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`
    await redis.del(key)
  },

  // Rate limiting
  async checkRateLimit(identifier: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`
    const current = await redis.get(key)
    
    if (!current) {
      await redis.setex(key, window, '1')
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: Date.now() + (window * 1000)
      }
    }

    const count = parseInt(current)
    if (count >= limit) {
      const ttl = await redis.ttl(key)
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + (ttl * 1000)
      }
    }

    await redis.incr(key)
    const ttl = await redis.ttl(key)
    return {
      allowed: true,
      remaining: limit - count - 1,
      resetTime: Date.now() + (ttl * 1000)
    }
  },

  // Store popular styles for quick access
  async updatePopularStyles(salonId: string, styles: any[]): Promise<void> {
    const key = `popular_styles:${salonId}`
    await redis.setex(key, 3600, JSON.stringify(styles)) // Cache for 1 hour
  },

  async getPopularStyles(salonId: string): Promise<any[] | null> {
    const key = `popular_styles:${salonId}`
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  },

  // Analytics caching
  async cacheAnalytics(salonId: string, analytics: any, ttl: number = 1800): Promise<void> {
    const key = `analytics:${salonId}`
    await redis.setex(key, ttl, JSON.stringify(analytics))
  },

  async getCachedAnalytics(salonId: string): Promise<any | null> {
    const key = `analytics:${salonId}`
    const cached = await redis.get(key)
    return cached ? JSON.parse(cached) : null
  }
}
