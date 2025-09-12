import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, analyticsOperations, sessionOperations } from '@/lib/supabase-server'
import { cacheOperations } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get('salon_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns this salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .eq('id', user.id)
      .single()

    if (salonError || !salon) {
      return NextResponse.json(
        { error: 'Salon not found or access denied' },
        { status: 404 }
      )
    }

    // Check cache first
    const cacheKey = `analytics:${salonId}:${startDate || 'all'}:${endDate || 'all'}`
    const cachedAnalytics = await cacheOperations.getCachedAnalytics(salonId)
    
    if (cachedAnalytics && !startDate && !endDate) {
      return NextResponse.json({
        success: true,
        ...cachedAnalytics,
        cached: true,
      })
    }

    // Get analytics data
    const analyticsData = await analyticsOperations.getSalonAnalytics(
      salonId,
      startDate || undefined,
      endDate || undefined
    )

    // Get active sessions
    const activeSessions = await sessionOperations.getActiveSessions(salonId)

    // Process analytics data
    const totalSessions = new Set(analyticsData.map(a => a.session_id)).size
    const totalAiUses = analyticsData.length

    // Popular styles
    const styleUsage = analyticsData.reduce((acc, item) => {
      if (item.style_name) {
        const key = `${item.style_name}-${item.category}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const popularStyles = Object.entries(styleUsage)
      .map(([key, count]) => {
        const [style_name, category] = key.split('-')
        return { style_name, category, usage_count: count }
      })
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10)

    // Daily usage (last 30 days)
    const dailyUsage = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayAnalytics = analyticsData.filter(a => 
        a.used_at.startsWith(dateStr)
      )
      
      const daySessions = new Set(dayAnalytics.map(a => a.session_id)).size
      
      dailyUsage.push({
        date: dateStr,
        sessions: daySessions,
        ai_uses: dayAnalytics.length,
      })
    }

    // Category breakdown
    const categoryUsage = analyticsData.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = (acc[item.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Average session duration and AI uses
    const sessionStats = await calculateSessionStats(salonId, startDate, endDate)

    const result = {
      total_sessions: totalSessions,
      active_sessions: activeSessions.length,
      total_ai_uses: totalAiUses,
      popular_styles: popularStyles,
      daily_usage: dailyUsage,
      category_usage: categoryUsage,
      session_stats: sessionStats,
      date_range: {
        start: startDate || analyticsData[analyticsData.length - 1]?.used_at?.split('T')[0],
        end: endDate || analyticsData[0]?.used_at?.split('T')[0],
      },
    }

    // Cache the result if no date filters
    if (!startDate && !endDate) {
      await cacheOperations.cacheAnalytics(salonId, result, 1800) // Cache for 30 minutes
    }

    return NextResponse.json({
      success: true,
      ...result,
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function calculateSessionStats(salonId: string, startDate?: string, endDate?: string) {
  try {
    // This would typically be a more complex query
    // For now, return mock data structure
    return {
      average_duration_minutes: 25,
      average_ai_uses_per_session: 3.2,
      completion_rate: 0.85,
      peak_hours: [
        { hour: 14, sessions: 12 },
        { hour: 15, sessions: 15 },
        { hour: 16, sessions: 18 },
      ],
    }
  } catch (error) {
    console.error('Session stats calculation error:', error)
    return null
  }
}
