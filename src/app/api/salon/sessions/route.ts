import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // For now, let's get the salon ID from query params or use a default
    // This is a temporary fix - in production you'd want proper auth
    const url = new URL(request.url)
    let salonId = url.searchParams.get('salon_id')
    
    // If no salon_id provided, get the first salon (for testing)
    if (!salonId) {
      const { data: salons, error: salonsError } = await supabaseAdmin
        .from('salons')
        .select('id')
        .limit(1)
      
      if (salonsError || !salons || salons.length === 0) {
        console.log('❌ Sessions API - No salons found:', salonsError?.message)
        return NextResponse.json({ error: 'No salons found' }, { status: 404 })
      }
      
      salonId = salons[0].id
    }

    console.log('✅ Sessions API - Using salon ID:', salonId)

    // Get URL parameters for pagination and filtering (reuse existing url variable)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get basic session data first (without joins)
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        created_at,
        expires_at,
        is_active,
        ai_uses_count,
        max_ai_uses
      `)
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sessionsError) {
      console.error('Sessions fetch error:', sessionsError)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)

    if (countError) {
      console.error('Sessions count error:', countError)
      return NextResponse.json({ error: 'Failed to count sessions' }, { status: 500 })
    }

    // Calculate session analytics
    const sessionAnalytics = sessions?.map(session => {
      const startTime = new Date(session.created_at)
      const endTime = session.is_active ? new Date() : new Date(session.expires_at)
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      
      return {
        id: session.id,
        start_time: session.created_at,
        end_time: session.is_active ? null : session.expires_at,
        duration_minutes: durationMinutes,
        is_active: session.is_active,
        ai_uses_count: session.ai_uses_count,
        max_ai_uses: session.max_ai_uses,
        generations: [],
        styles_used: []
      }
    }) || []

    // Calculate summary statistics
    const totalSessions = count || 0
    const activeSessions = sessions?.filter(s => s.is_active).length || 0
    const totalGenerations = sessions?.reduce((sum, s) => sum + (s.ai_uses_count || 0), 0) || 0
    const avgSessionDuration = sessionAnalytics.length > 0 
      ? Math.round(sessionAnalytics.reduce((sum, s) => sum + s.duration_minutes, 0) / sessionAnalytics.length)
      : 0

    return NextResponse.json({
      success: true,
      sessions: sessionAnalytics,
      pagination: {
        page,
        limit,
        total: totalSessions,
        total_pages: Math.ceil(totalSessions / limit)
      },
      summary: {
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        total_generations: totalGenerations,
        avg_session_duration_minutes: avgSessionDuration
      }
    })

  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 500 }
    )
  }
}
