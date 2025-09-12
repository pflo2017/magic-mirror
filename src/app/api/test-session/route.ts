import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Test if we can connect to database and check salons
    const { data: salons, error: salonsError } = await supabaseAdmin
      .from('salons')
      .select('id, name, email')
      .limit(5)

    if (salonsError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: salonsError
      })
    }

    // Test session creation with first salon
    if (salons && salons.length > 0) {
      const testSalonId = salons[0].id
      
      const sessionResponse = await fetch(`${request.nextUrl.origin}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: testSalonId })
      })
      
      const sessionData = await sessionResponse.json()
      
      return NextResponse.json({
        success: true,
        salons_found: salons.length,
        salons: salons,
        test_salon_id: testSalonId,
        session_test: sessionData
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No salons found in database',
      salons_found: 0
    })

  } catch (error) {
    console.error('Test session error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    })
  }
}
