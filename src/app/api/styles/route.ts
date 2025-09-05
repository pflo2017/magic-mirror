import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { data: styles, error } = await supabaseAdmin
      .from('styles')
      .select('id, name, category, description, prompt, image_url, is_active')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Styles fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch styles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      styles: styles || []
    })

  } catch (error) {
    console.error('Styles API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch styles' },
      { status: 500 }
    )
  }
}