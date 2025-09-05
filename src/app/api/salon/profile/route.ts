import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ salon: null, error: 'Not authenticated' }, { status: 401 })
    }
    
    // Get salon data for this user
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    
    if (salonError) {
      console.error('Salon fetch error:', salonError)
      return NextResponse.json({ salon: null, error: 'Salon not found' }, { status: 404 })
    }
    
    return NextResponse.json({ salon })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ salon: null, error: error.message }, { status: 500 })
  }
}
