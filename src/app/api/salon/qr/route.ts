import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const { salon_id, salon_name } = await request.json()

    if (!salon_id) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      )
    }

    // Generate the try-on URL using salon_id directly
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://192.168.0.80:3000'
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

    // Generate the try-on URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://192.168.0.80:3000'
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