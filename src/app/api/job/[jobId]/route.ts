import { NextRequest, NextResponse } from 'next/server'
import { getJobStatus } from '@/lib/queue'

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const jobStatus = await getJobStatus(jobId)

    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Map job states to user-friendly status
    let status = 'unknown'
    let message = 'Processing your transformation...'
    
    switch (jobStatus.state) {
      case 'waiting':
        status = 'queued'
        message = 'Your request is in queue...'
        break
      case 'active':
        status = 'processing'
        message = 'Creating your new look...'
        break
      case 'completed':
        status = 'completed'
        message = 'Your transformation is ready!'
        break
      case 'failed':
        status = 'failed'
        message = jobStatus.failedReason || 'Processing failed. Please try again.'
        break
      case 'delayed':
        status = 'delayed'
        message = 'Your request is delayed. Please wait...'
        break
    }

    return NextResponse.json({
      success: true,
      job_id: jobStatus.id,
      status,
      message,
      progress: jobStatus.progress || 0,
      result: jobStatus.result,
      processed_on: jobStatus.processedOn,
      finished_on: jobStatus.finishedOn,
      failed_reason: jobStatus.failedReason
    })

  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json(
      { error: 'Failed to get job status' },
      { status: 500 }
    )
  }
}

