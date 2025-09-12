import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salon_id = searchParams.get('salon_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    const transaction_type = searchParams.get('transaction_type')

    // Build query
    let query = supabaseAdmin
      .from('transaction_summary')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (salon_id) {
      query = query.eq('salon_id', salon_id)
    }
    if (start_date) {
      query = query.gte('created_at', start_date)
    }
    if (end_date) {
      query = query.lte('created_at', end_date)
    }
    if (transaction_type) {
      query = query.eq('transaction_type', transaction_type)
    }

    const { data: transactions, error } = await query

    if (error) {
      console.error('❌ Failed to fetch transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Calculate summary statistics
    const summary = {
      total_transactions: transactions?.length || 0,
      total_revenue: transactions?.reduce((sum, t) => sum + (parseFloat(t.total_charge) || 0), 0) || 0,
      total_images_sold: transactions?.reduce((sum, t) => sum + (t.overage_images || 0), 0) || 0,
      completed_transactions: transactions?.filter(t => t.final_status === 'completed').length || 0,
      refunded_transactions: transactions?.filter(t => t.final_status === 'refunded').length || 0,
      total_refunds: transactions?.reduce((sum, t) => sum + (parseFloat(t.refund_amount) || 0), 0) || 0,
      payment_methods: transactions?.reduce((acc, t) => {
        acc[t.payment_method_type || 'unknown'] = (acc[t.payment_method_type || 'unknown'] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {},
      daily_revenue: transactions?.reduce((acc, t) => {
        const date = new Date(t.created_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + (parseFloat(t.total_charge) || 0)
        return acc
      }, {} as Record<string, number>) || {}
    }

    return NextResponse.json({
      success: true,
      transactions,
      summary,
      filters: {
        salon_id,
        start_date,
        end_date,
        transaction_type
      }
    })

  } catch (error) {
    console.error('❌ Transaction API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// POST endpoint for refund processing
export async function POST(request: NextRequest) {
  try {
    const { transaction_id, refund_amount, reason } = await request.json()

    if (!transaction_id || !refund_amount) {
      return NextResponse.json(
        { error: 'Missing transaction_id or refund_amount' },
        { status: 400 }
      )
    }

    // Update transaction with refund information
    const { data, error } = await supabaseAdmin
      .from('billing_history')
      .update({
        refunded_at: new Date().toISOString(),
        refund_amount: refund_amount,
        payment_status: 'refunded',
        description: supabaseAdmin.raw(`description || ' - REFUNDED: ' || '${reason || 'No reason provided'}'`)
      })
      .eq('id', transaction_id)
      .select()

    if (error) {
      console.error('❌ Failed to process refund:', error)
      return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 })
    }

    console.log(`✅ Refund processed: ${refund_amount} for transaction ${transaction_id}`)

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      transaction: data?.[0]
    })

  } catch (error) {
    console.error('❌ Refund processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}

