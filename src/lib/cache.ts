import { createHash } from 'crypto'
import { createServerSupabaseClient } from './supabase-server'

// Generate hash for caching key
export function generateCacheKey(imageData: string, styleId: string): string {
  const imageHash = createHash('sha256').update(imageData).digest('hex').substring(0, 16)
  return `${imageHash}_${styleId}`
}

// Generate image hash for deduplication
export function generateImageHash(imageData: string): string {
  return createHash('sha256').update(imageData).digest('hex')
}

// Cache interface
interface CacheEntry {
  id: string
  cache_key: string
  image_hash: string
  style_id: string
  generated_image_url: string
  created_at: string
  last_accessed: string
  access_count: number
}

// Check if transformation exists in cache
export async function getCachedTransformation(imageData: string, styleId: string): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient()
    const cacheKey = generateCacheKey(imageData, styleId)
    
    const { data, error } = await supabase
      .from('image_cache')
      .select('generated_image_url, id')
      .eq('cache_key', cacheKey)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    // Update access statistics
    await supabase
      .from('image_cache')
      .update({
        last_accessed: new Date().toISOString(),
        access_count: supabase.sql`access_count + 1`
      })
      .eq('id', data.id)

    console.log(`Cache hit for key: ${cacheKey}`)
    return data.generated_image_url

  } catch (error) {
    console.error('Cache lookup error:', error)
    return null
  }
}

// Store transformation in cache
export async function storeCachedTransformation(
  imageData: string,
  styleId: string,
  generatedImageUrl: string,
  sessionId?: string
): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()
    const cacheKey = generateCacheKey(imageData, styleId)
    const imageHash = generateImageHash(imageData)

    await supabase
      .from('image_cache')
      .insert({
        cache_key: cacheKey,
        image_hash: imageHash,
        style_id: styleId,
        generated_image_url: generatedImageUrl,
        session_id: sessionId,
        created_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
        access_count: 1,
        is_active: true
      })

    console.log(`Cached transformation for key: ${cacheKey}`)

  } catch (error) {
    console.error('Cache storage error:', error)
    // Don't throw - caching failures shouldn't break the main flow
  }
}

// Clean up old cache entries
export async function cleanupCache(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()
    const cutoffDate = new Date(Date.now() - maxAge).toISOString()

    // Get old entries to delete their images from storage
    const { data: oldEntries } = await supabase
      .from('image_cache')
      .select('generated_image_url')
      .lt('last_accessed', cutoffDate)

    if (oldEntries && oldEntries.length > 0) {
      // Delete images from storage
      const filesToDelete = oldEntries
        .map(entry => {
          const url = entry.generated_image_url
          const match = url.match(/\/generated\/(.+)$/)
          return match ? `generated/${match[1]}` : null
        })
        .filter(Boolean) as string[]

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('hair-tryon-images')
          .remove(filesToDelete)
      }

      // Delete cache entries
      await supabase
        .from('image_cache')
        .delete()
        .lt('last_accessed', cutoffDate)

      console.log(`Cleaned up ${oldEntries.length} old cache entries`)
    }

  } catch (error) {
    console.error('Cache cleanup error:', error)
  }
}

// Get cache statistics
export async function getCacheStats() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: stats } = await supabase
      .from('image_cache')
      .select('*')
      .eq('is_active', true)

    if (!stats) {
      return {
        total_entries: 0,
        total_access_count: 0,
        avg_access_count: 0,
        cache_size_mb: 0
      }
    }

    const totalEntries = stats.length
    const totalAccessCount = stats.reduce((sum, entry) => sum + entry.access_count, 0)
    const avgAccessCount = totalEntries > 0 ? totalAccessCount / totalEntries : 0

    return {
      total_entries: totalEntries,
      total_access_count: totalAccessCount,
      avg_access_count: Math.round(avgAccessCount * 100) / 100,
      cache_size_mb: 0 // Would need to calculate actual file sizes
    }

  } catch (error) {
    console.error('Cache stats error:', error)
    return {
      total_entries: 0,
      total_access_count: 0,
      avg_access_count: 0,
      cache_size_mb: 0
    }
  }
}

// Invalidate cache for a specific style
export async function invalidateStyleCache(styleId: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()

    await supabase
      .from('image_cache')
      .update({ is_active: false })
      .eq('style_id', styleId)

    console.log(`Invalidated cache for style: ${styleId}`)

  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

// Preload popular transformations
export async function preloadPopularTransformations(): Promise<void> {
  try {
    const supabase = createServerSupabaseClient()

    // Get most popular styles from recent generations
    const { data: popularStyles } = await supabase
      .from('ai_generations')
      .select('style_id, count(*)')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .group('style_id')
      .order('count', { ascending: false })
      .limit(10)

    if (popularStyles && popularStyles.length > 0) {
      console.log('Popular styles for preloading:', popularStyles)
      // Here you could implement preloading logic for common face types
    }

  } catch (error) {
    console.error('Preload error:', error)
  }
}

