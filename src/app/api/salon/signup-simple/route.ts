import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, address } = await request.json()

    console.log('Simple signup request received:', { name, email, phone, address })

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Simulate successful salon creation (for testing without database)
    const mockSalon = {
      id: `salon_${Date.now()}`,
      name,
      email,
      subscription_status: 'active',
      session_duration: 30,
      max_ai_uses: 5,
      total_ai_generations_used: 0,
      free_trial_generations: 10,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`http://localhost:3001/salon/salon_${Date.now()}/tryon`)}`,
      tryon_url: `http://localhost:3001/salon/salon_${Date.now()}/tryon`,
      created_at: new Date().toISOString()
    }

    console.log('Mock salon created successfully:', mockSalon.id)

    return NextResponse.json({
      success: true,
      salon: mockSalon,
      message: 'This is a mock response for testing. Set up the database to enable full functionality.'
    })

  } catch (error) {
    console.error('Simple signup error:', error)
    return NextResponse.json(
      { error: `Failed to create salon account: ${error.message}` },
      { status: 500 }
    )
  }
}
