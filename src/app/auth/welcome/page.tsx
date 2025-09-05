'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, CheckCircle, Users, BarChart3, QrCode } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'

export default function Welcome() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [salon, setSalon] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthAndSalon()
  }, [])

  const checkAuthAndSalon = async () => {
    try {
      // Check if user is authenticated
      const response = await fetch('/api/auth/user')
      const userData = await response.json()
      
      if (userData.user) {
        setUser(userData.user)
        
        // Get salon data
        const salonResponse = await fetch('/api/salon/profile')
        const salonData = await salonResponse.json()
        
        if (salonData.salon) {
          setSalon(salonData.salon)
        }
      } else {
        // Not authenticated, redirect to login
        router.push('/salon/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/salon/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">HairTryOn</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-green-500 text-6xl mb-6">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to HairTryOn, {salon?.name || user?.email}! 🎉
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Your email has been verified and your salon account is now active!
          </p>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Your Free Trial Includes:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold text-sm">10</span>
                </div>
                <span>Free AI hair transformations</span>
              </div>
              <div className="flex items-center">
                <QrCode className="w-8 h-8 text-purple-600 mr-3" />
                <span>Your permanent QR code</span>
              </div>
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <span>30-minute client sessions</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
                <span>Basic usage analytics</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg inline-block"
            >
              Go to Your Dashboard
            </Link>
            
            <div className="text-sm text-gray-600">
              <p>Ready to transform your salon experience? Your dashboard has everything you need to get started.</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Next Steps:</h3>
            <div className="text-left space-y-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
                <span>Generate your salon's QR code</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
                <span>Print and display the QR code in your salon</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</div>
                <span>Let clients scan and try different hairstyles!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
