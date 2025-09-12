#!/usr/bin/env node

/**
 * AI Worker Process
 * 
 * This worker processes AI generation jobs from the Redis queue.
 * Run this as a separate process in production for better scalability.
 * 
 * Usage:
 *   npm run worker        # Production
 *   npm run dev:worker    # Development with auto-reload
 */

import { hairTransformWorker } from '../lib/queue'

console.log('🚀 AI Worker starting...')

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...')
  await hairTransformWorker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('📴 Received SIGINT, shutting down gracefully...')
  await hairTransformWorker.close()
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

console.log('✅ AI Worker is ready and waiting for jobs...')
console.log('📊 Worker configuration:')
console.log('   - Concurrency: 5 jobs')
console.log('   - Max retries: 3')
console.log('   - Backoff: Exponential (2s base)')
console.log('   - Redis URL:', process.env.REDIS_URL || 'redis://localhost:6379')

// Keep the process alive
setInterval(() => {
  // Optional: Add health check or metrics here
}, 30000)
