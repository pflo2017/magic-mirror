import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { sessionOperations, salonOperations } from './supabase'
import { cacheOperations } from './redis'
import { ClientSession, Salon, SessionValidationResponse } from '@/types/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface SessionTokenPayload {
  session_id: string
  salon_id: string
  expires_at: string
  iat?: number
  exp?: number
}

export class SessionManager {
  // Create a new client session
  static async createSession(
    salonId: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<{ session: ClientSession; token: string }> {
    try {
      // Get salon configuration
      const salon = await salonOperations.getById(salonId)
      if (!salon) {
        throw new Error('Salon not found')
      }

      if (salon.subscription_status !== 'active') {
        throw new Error('Salon subscription is not active')
      }

      // Calculate expiration time based on salon settings
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + salon.session_duration)

      // Create session in database
      const session = await sessionOperations.create({
        salon_id: salonId,
        expires_at: expiresAt.toISOString(),
        max_ai_uses: salon.max_ai_uses,
        client_ip: clientIp || null,
        user_agent: userAgent || null,
      })

      // Generate JWT token
      const tokenPayload: SessionTokenPayload = {
        session_id: session.id,
        salon_id: salonId,
        expires_at: session.expires_at,
      }

      const token = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: `${salon.session_duration}m`,
      })

      // Cache session data for quick access
      await cacheOperations.storeSession(session.id, {
        ...session,
        salon: salon,
      }, salon.session_duration * 60)

      return { session, token }
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    }
  }

  // Validate session token
  static async validateSession(token: string): Promise<SessionValidationResponse> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as SessionTokenPayload
      
      if (!decoded.session_id || !decoded.salon_id) {
        return { valid: false, error: 'Invalid token payload' }
      }

      // Check if session has expired
      const expiresAt = new Date(decoded.expires_at)
      const now = new Date()
      
      if (now > expiresAt) {
        return { valid: false, error: 'Session has expired' }
      }

      // Try to get session from cache first
      let sessionData = await cacheOperations.getSession(decoded.session_id)
      
      if (!sessionData) {
        // If not in cache, get from database
        const dbSession = await sessionOperations.getById(decoded.session_id)
        if (!dbSession) {
          return { valid: false, error: 'Session not found' }
        }

        sessionData = dbSession
        
        // Re-cache the session
        const timeRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        if (timeRemaining > 0) {
          await cacheOperations.storeSession(decoded.session_id, sessionData, timeRemaining)
        }
      }

      const session = sessionData.sessions || sessionData
      const salon = sessionData.salons || sessionData.salon

      // Check if salon subscription is still active
      if (salon.subscription_status !== 'active') {
        return { valid: false, error: 'Salon subscription is not active' }
      }

      // Check AI usage limits
      const remainingUses = session.max_ai_uses - session.ai_uses
      if (remainingUses <= 0) {
        return { valid: false, error: 'AI usage limit exceeded' }
      }

      // Calculate time remaining
      const timeRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)

      return {
        valid: true,
        session: session,
        salon: salon,
        remaining_uses: remainingUses,
        time_remaining: timeRemaining,
      }
    } catch (error) {
      console.error('Session validation failed:', error)
      
      if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' }
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token has expired' }
      }
      
      return { valid: false, error: 'Session validation failed' }
    }
  }

  // Increment AI usage for a session
  static async incrementAIUsage(sessionId: string): Promise<{ success: boolean; remaining_uses?: number; error?: string }> {
    try {
      // Get current session
      const sessionData = await cacheOperations.getSession(sessionId)
      let session: ClientSession
      
      if (sessionData) {
        session = sessionData.sessions || sessionData
      } else {
        const dbSession = await sessionOperations.getById(sessionId)
        if (!dbSession) {
          return { success: false, error: 'Session not found' }
        }
        session = dbSession.sessions || dbSession
      }

      // Check if usage limit would be exceeded
      if (session.ai_uses >= session.max_ai_uses) {
        return { success: false, error: 'AI usage limit exceeded' }
      }

      // Increment usage in database
      const newAiUses = session.ai_uses + 1
      const updatedSession = await sessionOperations.updateUsage(sessionId, newAiUses)

      // Update cache
      if (sessionData) {
        const updatedSessionData = {
          ...sessionData,
          sessions: updatedSession,
          ai_uses: newAiUses,
        }
        
        // Calculate remaining TTL
        const expiresAt = new Date(session.expires_at)
        const now = new Date()
        const timeRemaining = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        
        if (timeRemaining > 0) {
          await cacheOperations.storeSession(sessionId, updatedSessionData, timeRemaining)
        }
      }

      return {
        success: true,
        remaining_uses: session.max_ai_uses - newAiUses,
      }
    } catch (error) {
      console.error('Failed to increment AI usage:', error)
      return { success: false, error: 'Failed to update usage' }
    }
  }

  // Get session info without validation (for display purposes)
  static async getSessionInfo(sessionId: string): Promise<ClientSession | null> {
    try {
      // Try cache first
      const cachedSession = await cacheOperations.getSession(sessionId)
      if (cachedSession) {
        return cachedSession.sessions || cachedSession
      }

      // Fallback to database
      const dbSession = await sessionOperations.getById(sessionId)
      return dbSession ? (dbSession.sessions || dbSession) : null
    } catch (error) {
      console.error('Failed to get session info:', error)
      return null
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      // This would typically be run as a cron job
      // For now, we'll just log that it should be implemented
      console.log('Cleanup expired sessions - implement as cron job')
      
      // In a real implementation:
      // 1. Query for expired sessions
      // 2. Remove them from database
      // 3. Remove them from cache
      // 4. Clean up any associated files
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error)
    }
  }

  // Revoke a session (logout)
  static async revokeSession(sessionId: string): Promise<void> {
    try {
      // Remove from cache
      await cacheOperations.removeSession(sessionId)
      
      // In a real implementation, you might want to mark the session as revoked
      // rather than deleting it for audit purposes
      console.log(`Session ${sessionId} revoked`)
    } catch (error) {
      console.error('Failed to revoke session:', error)
    }
  }

  // Get active sessions for a salon
  static async getActiveSessions(salonId: string): Promise<ClientSession[]> {
    try {
      return await sessionOperations.getActiveSessions(salonId)
    } catch (error) {
      console.error('Failed to get active sessions:', error)
      return []
    }
  }

  // Generate session statistics for salon dashboard
  static async getSessionStats(salonId: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // This would query the database for session statistics
      // For now, return mock data structure
      return {
        total_sessions: 0,
        active_sessions: 0,
        average_session_duration: 0,
        total_ai_uses: 0,
        average_ai_uses_per_session: 0,
      }
    } catch (error) {
      console.error('Failed to get session stats:', error)
      return null
    }
  }
}

// Utility functions
export function generateSessionId(): string {
  return uuidv4()
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt)
}

export function getTimeRemaining(expiresAt: string): number {
  const now = new Date()
  const expires = new Date(expiresAt)
  return Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000))
}

export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}
