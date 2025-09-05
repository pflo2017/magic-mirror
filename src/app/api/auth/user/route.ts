import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth user error:', error)
      return NextResponse.json({ user: null, error: error.message }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ user: null, error: 'No user found' }, { status: 401 })
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ user: null, error: 'Failed to get user' }, { status: 500 })
  }
}
