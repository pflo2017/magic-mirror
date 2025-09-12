import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Query to get all tables in the public schema
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')

    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
      return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
    }

    // Get column information for each table
    const tableDetails = {}
    
    for (const table of tables || []) {
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position')

      if (!columnsError) {
        tableDetails[table.table_name] = columns
      }
    }

    return NextResponse.json({
      success: true,
      tables: tables?.map(t => t.table_name) || [],
      tableDetails
    })

  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Failed to query database structure' },
      { status: 500 }
    )
  }
}
