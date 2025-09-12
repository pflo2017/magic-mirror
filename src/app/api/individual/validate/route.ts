import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json()

    if (!session_token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Verify JWT token (all session info is stored in the token for individual users)
    let decoded: any
    try {
      decoded = jwt.verify(session_token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      )
    }

    // Check if session has expired
    const now = new Date()
    const expiresAt = new Date(decoded.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Calculate remaining time in seconds
    const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))

    return NextResponse.json({
      success: true,
      session: {
        id: decoded.session_id,
        user_type: decoded.user_type,
        ai_uses_remaining: decoded.ai_uses_remaining,
        time_remaining: timeRemaining,
        expires_at: decoded.expires_at
      }
    })

  } catch (error) {
    console.error('Individual session validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate session' },
      { status: 500 }
    )
  }
}
