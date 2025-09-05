import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      console.log('User authenticated:', data.user.id)
      
      // If this is a signup confirmation, redirect to welcome page
      if (type === 'signup') {
        return NextResponse.redirect(`${origin}/auth/welcome`)
      }
      
      // Otherwise redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
