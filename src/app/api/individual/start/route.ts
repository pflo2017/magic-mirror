import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Individual session configuration
const INDIVIDUAL_SESSION_CONFIG = {
  duration: 30, // 30 minutes
  max_ai_uses: 5, // 5 free AI generations
  max_active_sessions: 1 // Only one session per individual at a time
}

export async function POST(request: NextRequest) {
  try {
    const { user_type } = await request.json()

    if (user_type !== 'individual') {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    // Generate unique session ID
    const sessionId = uuidv4()
    
    // Calculate expiration time
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + INDIVIDUAL_SESSION_CONFIG.duration)

    // Create JWT token with session info (no database storage needed for individual users)
    const sessionToken = jwt.sign(
      { 
        session_id: sessionId, 
        user_type: 'individual',
        max_ai_uses: INDIVIDUAL_SESSION_CONFIG.max_ai_uses,
        ai_uses_remaining: INDIVIDUAL_SESSION_CONFIG.max_ai_uses,
        session_duration: INDIVIDUAL_SESSION_CONFIG.duration,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: `${INDIVIDUAL_SESSION_CONFIG.duration}m` }
    )

    console.log('✅ Individual session created (client-side):', {
      session_id: sessionId,
      expires_at: expiresAt.toISOString(),
      max_ai_uses: INDIVIDUAL_SESSION_CONFIG.max_ai_uses
    })

    return NextResponse.json({
      success: true,
      session_token: sessionToken,
      session_id: sessionId,
      max_ai_uses: INDIVIDUAL_SESSION_CONFIG.max_ai_uses,
      session_duration: INDIVIDUAL_SESSION_CONFIG.duration,
      expires_at: expiresAt.toISOString(),
      user_type: 'individual'
    })

  } catch (error) {
    console.error('Individual session start error:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}
