'use client'

import { useState, useEffect } from 'react'
import { 
  QrCode, 
  Download, 
  Users, 
  Zap, 
  TrendingUp, 
  Settings, 
  CreditCard,
  BarChart3,
  Clock,
  Palette,
  User,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SalonAnalytics {
  total_sessions: number
  active_sessions: number
  total_ai_uses: number
  popular_styles: Array<{
    style_name: string
    category: string
    usage_count: number
  }>
  daily_usage: Array<{
    date: string
    sessions: number
    ai_uses: number
  }>
  category_usage: Record<string, number>
}

interface Salon {
  id: string
  name: string
  email: string
  subscription_status: string
  session_duration: number
  max_ai_uses: number
  qr_code_url: string | null
  location?: string
  city?: string
  address?: string
  total_ai_generations_used?: number
  free_trial_generations?: number
}

export default function Dashboard() {
  const [salon, setSalon] = useState<Salon | null>(null)
  const [analytics, setAnalytics] = useState<SalonAnalytics | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [tryOnUrl, setTryOnUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'settings'>('overview')
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    city: '',
    address: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Get current user from Supabase client
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Not authenticated, redirect to login
        window.location.href = '/salon/login'
        return
      }

      // Create a basic salon object from user data
              // Fetch actual salon data from database
        const { data: salonData, error: salonError } = await supabase
          .from('salons')
          .select('*')
          .eq('auth_user_id', user.id)
          .single() as { data: any, error: any }

        if (salonData && !salonError) {
          setSalon({
            id: salonData.id,
            name: salonData.name || `Salon ${user.email}`,
            email: salonData.email || user.email,
            subscription_status: salonData.subscription_status || 'active',
            session_duration: salonData.session_duration || 30,
            max_ai_uses: salonData.max_ai_uses || 5,
            total_ai_generations_used: salonData.total_ai_generations_used || 0,
            free_trial_generations: salonData.free_trial_generations || 10,
            qr_code_url: null,
            location: salonData.location,
            city: salonData.city,
            address: salonData.address
          })
          
          // Check if profile is incomplete
          const isProfileIncomplete = !salonData.name || !salonData.city || !salonData.address
          if (isProfileIncomplete) {
            setProfileForm({
              name: salonData.name || '',
              city: salonData.city || '',
              address: salonData.address || ''
            })
          }
        } else {
          // Create a basic salon entry if none exists
          setSalon({
            id: user.id,
            name: '',
            email: user.email || '',
            subscription_status: 'active',
            session_duration: 30,
            max_ai_uses: 5,
            total_ai_generations_used: 0,
            free_trial_generations: 10,
            qr_code_url: null,
            location: '',
            city: '',
            address: ''
          })
          
          // Set form to show profile completion
          setProfileForm({
            name: '',
            city: '',
            address: ''
          })
        }
      
      // Set basic analytics
      setAnalytics({
        total_sessions: 0,
        active_sessions: 0,
        total_ai_uses: 0,
        popular_styles: [],
        daily_usage: [],
        category_usage: {}
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      window.location.href = '/salon/login'
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      if (!salon?.id) {
        alert('No salon ID found')
        return
      }
      
      console.log('Generating QR code for salon:', salon.id)
      
      const response = await fetch('/api/salon/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          salon_id: salon.id,
          salon_name: salon.name 
        }),
      })

      console.log('QR API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('QR API response data:', data)
        console.log('New try-on URL:', data.tryon_url)
        console.log('Old try-on URL:', tryOnUrl)
        setQrCodeUrl(data.qr_code_url)
        setTryOnUrl(data.tryon_url)
        alert(`QR code regenerated! New URL: ${data.tryon_url}`)
      } else {
        const errorData = await response.json()
        console.error('QR API error:', errorData)
        alert(`Failed to generate QR code: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      alert(`Failed to generate QR code: ${(error as Error).message}`)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `${salon?.name || 'salon'}-qr-code.png`
      link.click()
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/salon/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      window.location.href = '/salon/login'
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profileForm.name.trim() || !profileForm.city.trim() || !profileForm.address.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in again')
        window.location.href = '/salon/login'
        return
      }

      const response = await fetch('/api/salon/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salon_name: profileForm.name.trim(),
          city: profileForm.city.trim(),
          address: profileForm.address.trim(),
          user_id: user.id,
          email: user.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Profile update error:', result)
        alert(result.error || 'Failed to update profile. Please try again.')
        return
      }

      // Update salon state with new data
      if (salon) {
        setSalon({
          ...salon,
          name: profileForm.name.trim(),
          city: profileForm.city.trim(),
          address: profileForm.address.trim()
        })
      }

      setShowProfileForm(false)
      alert('Profile updated successfully!')
      
    } catch (error) {
      console.error('Profile update error:', error as Error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const isProfileIncomplete = salon && (!salon.name || !salon.city || !salon.address)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {salon?.name || 'Your Salon'} Dashboard
              </h1>
              <p className="text-gray-600">Manage your virtual hair try-on experience</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Subscription Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  salon?.subscription_status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {salon?.subscription_status || 'Unknown'}
                </span>
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Billing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {/* Profile Completion Banner */}
      {isProfileIncomplete && !showProfileForm && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Complete Your Salon Profile</h3>
                  <p className="text-sm text-yellow-700">Add your salon details to get started with QR codes and client sessions.</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleProfileSubmit} className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Salon Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salon Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your salon name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full address"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowProfileForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp },
              { id: 'settings', name: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Free Trial Status */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Free Trial Active</h3>
                  <p className="text-green-700">
                    {salon?.free_trial_generations || 10} AI generations remaining
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {salon?.free_trial_generations || 10}
                  </div>
                  <div className="text-sm text-green-600">Credits Left</div>
                </div>
              </div>
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Clients Today</p>
                    <p className="text-2xl font-semibold text-gray-900">0</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Zap className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Credits Used</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {salon?.total_ai_generations_used || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Subscription</p>
                    <p className="text-lg font-semibold text-green-600">Free Trial</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your QR Code</h3>
                <div className="text-center">
                  {qrCodeUrl ? (
                    <div>
                      <img
                        src={qrCodeUrl}
                        alt="Salon QR Code"
                        className="mx-auto mb-4 border rounded-lg"
                        style={{ maxWidth: '200px' }}
                      />
                      <div className="space-y-2">
                        <button
                          onClick={downloadQRCode}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mr-2"
                        >
                          <Download className="w-4 h-4 inline mr-2" />
                          Download
                        </button>
                        <button
                          onClick={generateQRCode}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <button
                        onClick={generateQRCode}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Try-On URL</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Direct Link
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tryOnUrl || 'Generate QR code first'}
                        readOnly
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50"
                      />
                      <button
                        onClick={() => tryOnUrl && navigator.clipboard.writeText(tryOnUrl)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-r-lg hover:bg-gray-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>• Display this QR code in your salon</p>
                    <p>• Clients scan to start their try-on session</p>
                    <p>• Sessions last {salon?.session_duration || 30} minutes</p>
                    <p>• Each session allows {salon?.max_ai_uses || 5} AI generations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Styles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Styles This Week</h3>
              <div className="space-y-3">
                {analytics?.popular_styles?.slice(0, 5).map((style, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{style.style_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{style.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {style.usage_count} uses
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No data available yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Over Time</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Chart visualization would go here</p>
                  <p className="text-sm">Integrate with a charting library like Chart.js or Recharts</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(analytics?.category_usage || {}).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize text-gray-700">{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {analytics?.daily_usage?.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{day.date}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{day.sessions} sessions</div>
                        <div className="text-xs text-gray-500">{day.ai_uses} AI uses</div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={salon?.session_duration || 30}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="5"
                    max="120"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long each client session lasts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max AI Uses per Session
                  </label>
                  <input
                    type="number"
                    value={salon?.max_ai_uses || 5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    min="1"
                    max="20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many styles clients can try per session
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Save Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Salon Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salon Name
                  </label>
                  <input
                    type="text"
                    value={salon?.name || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={salon?.email || ''}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Update Information
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
