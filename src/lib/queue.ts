import { Queue, Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { processWithImagenAPI } from './gemini'
import { createServerSupabaseClient } from './supabase-server'
import { getCachedTransformation, storeCachedTransformation } from './cache'

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
})

// Hair transformation queue
export const hairTransformQueue = new Queue('hair-transformation', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Job data interface
interface HairTransformJobData {
  sessionId: string
  salonId: string
  styleId: string
  originalImageUrl: string
  originalImageData?: string // Base64 data for caching
  prompt: any
  userId?: string
}

// Job result interface
interface HairTransformResult {
  success: boolean
  generatedImageUrl?: string
  error?: string
  processingTime: number
}

// Add job to queue
export async function addHairTransformJob(data: HairTransformJobData): Promise<Job> {
  const job = await hairTransformQueue.add(
    'transform-hair',
    data,
    {
      priority: 1, // Higher priority for paying customers
      delay: 0,    // Process immediately
    }
  )
  
  console.log(`Added hair transform job ${job.id} to queue`)
  return job
}

// Worker to process hair transformation jobs
export const hairTransformWorker = new Worker(
  'hair-transformation',
  async (job: Job<HairTransformJobData>): Promise<HairTransformResult> => {
    const startTime = Date.now()
    console.log(`Processing hair transform job ${job.id}`)
    
    try {
      const { sessionId, salonId, styleId, originalImageUrl, originalImageData, prompt } = job.data
      
      // Update job progress
      await job.updateProgress(10)
      
      let generatedImageUrl: string | null = null
      
      // Check cache first if we have image data
      if (originalImageData) {
        console.log(`Checking cache for job ${job.id}`)
        generatedImageUrl = await getCachedTransformation(originalImageData, styleId)
        
        if (generatedImageUrl) {
          console.log(`Cache hit for job ${job.id}`)
          await job.updateProgress(100)
          
          // Store result in database (even for cache hits)
          const supabase = createServerSupabaseClient()
          
          await supabase
            .from('ai_generations')
            .insert({
              session_id: sessionId,
              style_id: styleId,
              original_image_url: originalImageUrl,
              generated_image_url: generatedImageUrl,
              processing_time_ms: Date.now() - startTime,
              prompt_used: prompt,
              was_cached: true
            })
          
          const result: HairTransformResult = {
            success: true,
            generatedImageUrl,
            processingTime: Date.now() - startTime
          }
          
          console.log(`Completed cached hair transform job ${job.id} in ${result.processingTime}ms`)
          return result
        }
      }
      
      await job.updateProgress(30)
      
      // Call AI processing if not cached
      console.log(`Processing AI transformation for job ${job.id}`)
      const aiResult = await processWithImagenAPI({
        originalImageUrl,
        prompt,
        styleId
      })
      
      await job.updateProgress(80)
      
      if (!aiResult.success) {
        throw new Error(aiResult.error || 'AI processing failed')
      }
      
      generatedImageUrl = aiResult.generated_image_url!
      
      // Store in cache for future use
      if (originalImageData && generatedImageUrl) {
        await storeCachedTransformation(originalImageData, styleId, generatedImageUrl, sessionId)
      }
      
      // Store result in database
      const supabase = createServerSupabaseClient()
      
      await supabase
        .from('ai_generations')
        .insert({
          session_id: sessionId,
          style_id: styleId,
          original_image_url: originalImageUrl,
          generated_image_url: generatedImageUrl,
          processing_time_ms: Date.now() - startTime,
          prompt_used: prompt,
          was_cached: false
        })
      
      await job.updateProgress(100)
      
      const result: HairTransformResult = {
        success: true,
        generatedImageUrl,
        processingTime: Date.now() - startTime
      }
      
      console.log(`Completed hair transform job ${job.id} in ${result.processingTime}ms`)
      return result
      
    } catch (error) {
      console.error(`Hair transform job ${job.id} failed:`, error)
      
      const result: HairTransformResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      }
      
      return result
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 jobs simultaneously
    limiter: {
      max: 10,      // Maximum 10 jobs per duration
      duration: 60000, // 1 minute
    },
  }
)

// Queue event handlers
hairTransformQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

hairTransformQueue.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

hairTransformQueue.on('stalled', (jobId) => {
  console.warn(`Job ${jobId} stalled`)
})

// Worker event handlers
hairTransformWorker.on('completed', (job, result) => {
  console.log(`Worker completed job ${job.id}:`, result)
})

hairTransformWorker.on('failed', (job, err) => {
  console.error(`Worker failed job ${job?.id}:`, err)
})

hairTransformWorker.on('error', (err) => {
  console.error('Worker error:', err)
})

// Utility functions
export async function getJobStatus(jobId: string) {
  const job = await Job.fromId(hairTransformQueue, jobId)
  if (!job) {
    return null
  }
  
  return {
    id: job.id,
    progress: job.progress,
    state: await job.getState(),
    data: job.data,
    result: job.returnvalue,
    failedReason: job.failedReason,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  }
}

export async function cancelJob(jobId: string): Promise<boolean> {
  const job = await Job.fromId(hairTransformQueue, jobId)
  if (!job) {
    return false
  }
  
  await job.remove()
  return true
}

export async function getQueueStats() {
  const waiting = await hairTransformQueue.getWaiting()
  const active = await hairTransformQueue.getActive()
  const completed = await hairTransformQueue.getCompleted()
  const failed = await hairTransformQueue.getFailed()
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    total: waiting.length + active.length + completed.length + failed.length
  }
}

// Graceful shutdown
export async function closeQueue() {
  await hairTransformWorker.close()
  await hairTransformQueue.close()
  await redis.quit()
}

// Health check
export async function isQueueHealthy(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Queue health check failed:', error)
    return false
  }
}