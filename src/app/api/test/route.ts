import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test 1: Check if we can connect to Supabase at all
    console.log('Test 1: Basic connection test - checking tables')
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    console.log('Available tables:', tablesData)
    
    if (tablesError) {
      console.error('Tables query error:', tablesError)
    }

    // Test 2: Try to access salons table
    console.log('Test 2: Salons table access test')
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('salons')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('Connection error:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      })
    }

    console.log('Connection successful')

    // Test 2: Try to insert a test salon
    console.log('Test 2: Insert test salon')
    const testSalon = {
      name: 'Test Salon',
      email: `test-${Date.now()}@example.com`,
      subscription_status: 'active' as const,
      session_duration: 30,
      max_ai_uses: 5,
      total_ai_generations_used: 0,
      free_trial_generations: 10,
    }

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('salons')
      .insert(testSalon)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert test salon',
        details: insertError
      })
    }

    console.log('Insert successful:', insertData)

    // Test 3: Clean up - delete the test salon
    console.log('Test 3: Cleanup test salon')
    const { error: deleteError } = await supabaseAdmin
      .from('salons')
      .delete()
      .eq('id', insertData.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
    }

    return NextResponse.json({
      success: true,
      message: 'All database tests passed!',
      testSalon: insertData
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error.message
    })
  }
}
