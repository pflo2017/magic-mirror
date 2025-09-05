import QRCode from 'qrcode'
import { supabase, salonOperations } from './supabase'
import { Database } from '@/types/database'

type Salon = Database['public']['Tables']['salons']['Row']

export interface QRCodeOptions {
  size?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export class QRCodeManager {
  // Generate QR code for a salon
  static async generateSalonQRCode(
    salonId: string,
    options: QRCodeOptions = {}
  ): Promise<{ qrCodeUrl: string; tryOnUrl: string }> {
    try {
      // Get salon info
      const salon = await salonOperations.getById(salonId)
      if (!salon) {
        throw new Error('Salon not found')
      }

      // Generate the try-on URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const tryOnUrl = `${baseUrl}/salon/${salonId}/tryon`

      // Configure QR code options
      const qrOptions = {
        width: options.size || 300,
        margin: options.margin || 2,
        color: {
          dark: options.color?.dark || '#000000',
          light: options.color?.light || '#FFFFFF',
        },
        errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
      }

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(tryOnUrl, qrOptions)

      // Convert data URL to buffer
      const base64Data = qrCodeDataUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')

      // Upload to Supabase Storage
      const fileName = `qr-codes/${salonId}.png`
      
      const { data, error } = await supabase.storage
        .from('salon-assets')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true, // Replace if exists
        })

      if (error) {
        throw new Error(`Failed to upload QR code: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(fileName)

      const qrCodeUrl = urlData.publicUrl

      // Update salon with QR code URL
      await salonOperations.update(salonId, {
        qr_code_url: qrCodeUrl,
      })

      return {
        qrCodeUrl,
        tryOnUrl,
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      throw error
    }
  }

  // Generate QR code with custom branding
  static async generateBrandedQRCode(
    salonId: string,
    branding: {
      logo?: string
      colors?: {
        primary: string
        secondary: string
      }
      text?: string
    },
    options: QRCodeOptions = {}
  ): Promise<{ qrCodeUrl: string; tryOnUrl: string }> {
    try {
      const salon = await salonOperations.getById(salonId)
      if (!salon) {
        throw new Error('Salon not found')
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const tryOnUrl = `${baseUrl}/salon/${salonId}/tryon`

      // For branded QR codes, you would typically use a more advanced library
      // or service that supports logo embedding and custom styling
      // For now, we'll use the standard QR code with custom colors

      const qrOptions = {
        width: options.size || 400,
        margin: options.margin || 4,
        color: {
          dark: branding.colors?.primary || options.color?.dark || '#000000',
          light: branding.colors?.secondary || options.color?.light || '#FFFFFF',
        },
        errorCorrectionLevel: options.errorCorrectionLevel || 'H' as const, // Higher error correction for logo embedding
      }

      const qrCodeDataUrl = await QRCode.toDataURL(tryOnUrl, qrOptions)
      
      // In a real implementation, you would:
      // 1. Generate the base QR code
      // 2. Use Canvas or similar to overlay the logo
      // 3. Add custom text/branding around the QR code
      // 4. Apply custom styling and colors

      const base64Data = qrCodeDataUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')

      const fileName = `qr-codes/branded-${salonId}.png`
      
      const { data, error } = await supabase.storage
        .from('salon-assets')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        throw new Error(`Failed to upload branded QR code: ${error.message}`)
      }

      const { data: urlData } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(fileName)

      const qrCodeUrl = urlData.publicUrl

      await salonOperations.update(salonId, {
        qr_code_url: qrCodeUrl,
      })

      return {
        qrCodeUrl,
        tryOnUrl,
      }
    } catch (error) {
      console.error('Failed to generate branded QR code:', error)
      throw error
    }
  }

  // Generate QR code as SVG (for better scalability)
  static async generateSVGQRCode(
    salonId: string,
    options: QRCodeOptions = {}
  ): Promise<{ qrCodeSvg: string; tryOnUrl: string }> {
    try {
      const salon = await salonOperations.getById(salonId)
      if (!salon) {
        throw new Error('Salon not found')
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const tryOnUrl = `${baseUrl}/salon/${salonId}/tryon`

      const qrOptions = {
        width: options.size || 300,
        margin: options.margin || 2,
        color: {
          dark: options.color?.dark || '#000000',
          light: options.color?.light || '#FFFFFF',
        },
        errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
      }

      // Generate QR code as SVG
      const qrCodeSvg = await QRCode.toString(tryOnUrl, {
        type: 'svg',
        ...qrOptions,
      })

      return {
        qrCodeSvg,
        tryOnUrl,
      }
    } catch (error) {
      console.error('Failed to generate SVG QR code:', error)
      throw error
    }
  }

  // Get existing QR code for a salon
  static async getSalonQRCode(salonId: string): Promise<{ qrCodeUrl: string | null; tryOnUrl: string }> {
    try {
      const salon = await salonOperations.getById(salonId)
      if (!salon) {
        throw new Error('Salon not found')
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const tryOnUrl = `${baseUrl}/salon/${salonId}/tryon`

      return {
        qrCodeUrl: salon.qr_code_url,
        tryOnUrl,
      }
    } catch (error) {
      console.error('Failed to get salon QR code:', error)
      throw error
    }
  }

  // Regenerate QR code (useful if URL structure changes)
  static async regenerateQRCode(salonId: string, options: QRCodeOptions = {}): Promise<{ qrCodeUrl: string; tryOnUrl: string }> {
    try {
      // Delete old QR code if it exists
      const oldFileName = `qr-codes/${salonId}.png`
      await supabase.storage
        .from('salon-assets')
        .remove([oldFileName])

      // Generate new QR code
      return await this.generateSalonQRCode(salonId, options)
    } catch (error) {
      console.error('Failed to regenerate QR code:', error)
      throw error
    }
  }

  // Generate printable QR code with salon info
  static async generatePrintableQRCode(
    salonId: string,
    options: {
      includeInstructions?: boolean
      customText?: string
      size?: 'small' | 'medium' | 'large'
    } = {}
  ): Promise<{ qrCodeUrl: string; tryOnUrl: string }> {
    try {
      const salon = await salonOperations.getById(salonId)
      if (!salon) {
        throw new Error('Salon not found')
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const tryOnUrl = `${baseUrl}/salon/${salonId}/tryon`

      // Size configurations
      const sizeConfig = {
        small: { width: 200, margin: 2 },
        medium: { width: 300, margin: 3 },
        large: { width: 400, margin: 4 },
      }

      const size = options.size || 'medium'
      const config = sizeConfig[size]

      const qrOptions = {
        width: config.width,
        margin: config.margin,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M' as const,
      }

      // For printable QR codes, you might want to:
      // 1. Add salon name and instructions
      // 2. Include contact information
      // 3. Add branding elements
      // 4. Ensure high contrast for printing

      const qrCodeDataUrl = await QRCode.toDataURL(tryOnUrl, qrOptions)
      const base64Data = qrCodeDataUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')

      const fileName = `qr-codes/printable-${salonId}-${size}.png`
      
      const { data, error } = await supabase.storage
        .from('salon-assets')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        throw new Error(`Failed to upload printable QR code: ${error.message}`)
      }

      const { data: urlData } = supabase.storage
        .from('salon-assets')
        .getPublicUrl(fileName)

      return {
        qrCodeUrl: urlData.publicUrl,
        tryOnUrl,
      }
    } catch (error) {
      console.error('Failed to generate printable QR code:', error)
      throw error
    }
  }

  // Validate QR code URL
  static validateTryOnUrl(url: string): { valid: boolean; salonId?: string; error?: string } {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      
      // Expected format: /salon/{salonId}/tryon
      if (pathParts.length !== 4 || pathParts[1] !== 'salon' || pathParts[3] !== 'tryon') {
        return { valid: false, error: 'Invalid URL format' }
      }

      const salonId = pathParts[2]
      if (!salonId || salonId.length === 0) {
        return { valid: false, error: 'Missing salon ID' }
      }

      return { valid: true, salonId }
    } catch (error) {
      return { valid: false, error: 'Invalid URL' }
    }
  }
}

// Utility functions
export function generateTryOnUrl(salonId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/salon/${salonId}/tryon`
}

export function extractSalonIdFromUrl(url: string): string | null {
  const validation = QRCodeManager.validateTryOnUrl(url)
  return validation.valid ? validation.salonId! : null
}
