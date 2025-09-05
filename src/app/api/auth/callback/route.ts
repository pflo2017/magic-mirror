import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { salonOperations } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = createServerSupabaseClient()
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/salon/login?error=auth_failed`)
      }

      if (data.user) {
        // Check if salon exists with this email
        let salon = await salonOperations.getByEmail(data.user.email!)
        
        if (!salon) {
          // Create a new salon record for Google OAuth users
          salon = await salonOperations.create({
            name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
            email: data.user.email!,
            subscription_status: 'inactive', // They'll need to subscribe
            session_duration: 30,
            max_ai_uses: 5,
          })
        }

        // Redirect to dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/salon/login?error=auth_failed`)
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${origin}/salon/login?error=no_code`)
}

