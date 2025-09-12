import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { networkInterfaces } from 'os'

// Function to dynamically get the current network IP
function getCurrentNetworkIP(): string {
  const nets = networkInterfaces()
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  
  return 'localhost' // fallback
}

// Function to get the base URL from request headers
function getBaseUrl(request: NextRequest): string {
  // Try to get the host from headers
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  
  if (host) {
    // If host is localhost, replace with current network IP for mobile access
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      const networkIP = getCurrentNetworkIP()
      const port = host.split(':')[1] || '3000'
      return `${protocol}://${networkIP}:${port}`
    }
    return `${protocol}://${host}`
  }
  
  // Fallback: use current network IP with default port
  const networkIP = getCurrentNetworkIP()
  return process.env.NEXT_PUBLIC_APP_URL || `http://${networkIP}:3000`
}

export async function POST(request: NextRequest) {
  try {
    const { salon_id, salon_name } = await request.json()

    if (!salon_id) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // Generate the try-on URL using dynamic base URL
    const baseUrl = getBaseUrl(request)
    const tryOnUrl = `${baseUrl}/salon/${salon_id}/tryon`
    
    // Debug logging
    console.log('🔗 QR Code Generation:', {
      host: request.headers.get('host'),
      protocol: request.headers.get('x-forwarded-proto'),
      baseUrl,
      tryOnUrl
    })

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(tryOnUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    return NextResponse.json({
      success: true,
      qr_code_url: qrCodeDataUrl,
      tryon_url: tryOnUrl,
      salon_id: salon_id
    })

  } catch (error) {
    console.error('QR code generation error:', error)
    // Updated to use network IP
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salon_id = searchParams.get('salon_id')

    if (!salon_id) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // Generate the try-on URL using dynamic base URL
    const baseUrl = getBaseUrl(request)
    const tryOnUrl = `${baseUrl}/salon/${salon_id}/tryon`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(tryOnUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })

    return NextResponse.json({
      success: true,
      qr_code_url: qrCodeDataUrl,
      tryon_url: tryOnUrl,
      salon: {
        id: salon_id,
        name: `Salon ${salon_id}`,
        subscription_status: 'active'
      }
    })

  } catch (error) {
    console.error('QR code fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch QR code' },
      { status: 500 }
    )
  }
}