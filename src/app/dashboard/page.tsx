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
  Calendar,
  Sparkles,
  LogOut,
  Edit3,
  CheckCircle,
  X,
  ArrowRight,
  ExternalLink
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

interface SessionData {
  id: string
  start_time: string
  end_time: string | null
  duration_minutes: number
  is_active: boolean
  ai_uses_count: number
  max_ai_uses: number
  generations: Array<{
    id: string
    created_at: string
    processing_time_ms: number
  }>
  styles_used: Array<{
    style_name: string
    category: string
    created_at: string
    processing_time_ms: number
  }>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'sessions' | 'settings'>('overview')
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    city: '',
    address: ''
  })
  const [showSettingsForm, setShowSettingsForm] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    session_duration: 30,
    max_ai_uses: 20
  })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [sessionsSummary, setSessionsSummary] = useState<any>(null)
  const [sessionsLoading, setSessionsLoading] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'sessions' || activeTab === 'overview') {
      loadSessionsData()
    }
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        window.location.href = '/salon/login'
        return
      }

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
        
        const isProfileIncomplete = !salonData.name || !salonData.city || !salonData.address
        if (isProfileIncomplete) {
          setShowProfileForm(true)
        }
        // Always set the profile form data for editing
        setProfileForm({
          name: salonData.name || '',
          city: salonData.city || '',
          address: salonData.address || ''
        })
        
        // Set settings form data
        setSettingsForm({
          session_duration: salonData.session_duration || 30,
          max_ai_uses: salonData.max_ai_uses || 20
        })
      } else {
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
        
        setShowProfileForm(true)
        setProfileForm({
          name: '',
          city: '',
          address: ''
        })
      }
      
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

  const loadSessionsData = async () => {
    setSessionsLoading(true)
    try {
      console.log('🔍 Loading sessions data...')
      const response = await fetch('/api/salon/sessions', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📡 Sessions API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Sessions data loaded:', data)
        setSessions(data.sessions)
        setSessionsSummary(data.summary)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Failed to load sessions data:', errorData)
        console.error('❌ Response status:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Sessions data error:', error)
    } finally {
      setSessionsLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      if (!salon?.id) {
        alert('No salon ID found')
        return
      }
      
      const response = await fetch('/api/salon/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          salon_id: salon.id,
          salon_name: salon.name 
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setQrCodeUrl(data.qr_code_url)
        setTryOnUrl(data.tryon_url)
      } else {
        const errorData = await response.json()
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
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        alert('Authentication required')
        return
      }

      const response = await fetch('/api/salon/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          salon_name: profileForm.name,
          city: profileForm.city,
          address: profileForm.address
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        setShowProfileForm(false)
        
        // Update the salon state with the new data
        if (responseData.salon) {
          setSalon(prev => prev ? {
            ...prev,
            name: responseData.salon.name,
            city: responseData.salon.city,
            address: responseData.salon.address,
            location: responseData.salon.location
          } : prev)
        }
        
        // Reload dashboard data to ensure everything is in sync
        loadDashboardData()
      } else {
        const errorData = await response.json()
        alert(`Failed to save salon information: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to save salon information. Please try again.')
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        alert('Authentication required')
        return
      }

      const response = await fetch('/api/salon/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          session_duration: settingsForm.session_duration,
          max_ai_uses: settingsForm.max_ai_uses
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        setShowSettingsForm(false)
        
        // Update the salon state with the new settings
        if (responseData.salon) {
          setSalon(prev => prev ? {
            ...prev,
            session_duration: responseData.salon.session_duration,
            max_ai_uses: responseData.salon.max_ai_uses
          } : prev)
        }
        
        setShowSuccessModal(true)
        // Auto-hide modal after 3 seconds
        setTimeout(() => setShowSuccessModal(false), 3000)
      } else {
        const errorData = await response.json()
        alert(`Failed to update settings: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Settings update error:', error)
      alert('Failed to update settings. Please try again.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/salon/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/80">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isProfileIncomplete = !salon?.name || !salon?.city || !salon?.address

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <div className="absolute inset-0 h-8 w-8 text-purple-400 animate-pulse opacity-50">
                  <Sparkles className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Magic Mirror
                </h1>
                <p className="text-white/60 text-sm">Salon Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-medium">{salon?.name || 'Your Salon'}</p>
                <p className="text-white/60 text-sm">{salon?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Completion Banner */}
      {isProfileIncomplete && (
        <div className="relative z-40 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border-b border-yellow-400/20">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Complete your salon profile</p>
                  <p className="text-white/70 text-sm">Add your salon details to get started</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileForm(true)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-full font-medium hover:bg-yellow-400 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="relative z-30 bg-black/10 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'sessions', label: 'Sessions', icon: Clock },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-400 text-white'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Sessions</p>
                    <p className="text-white text-2xl font-bold">{sessionsSummary?.total_sessions || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Images Generated</p>
                    <p className="text-white text-2xl font-bold">{sessionsSummary?.total_generations || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Free Trial Left</p>
                    <p className="text-white text-2xl font-bold">{salon?.free_trial_generations || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Session Duration</p>
                    <p className="text-white text-2xl font-bold">{salon?.session_duration || 30}m</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Your Salon QR Code</h2>
                  <p className="text-white/70 mb-6">
                    Clients scan this QR code to access your virtual hair try-on experience. 
                    Print it and display it in your salon.
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={generateQRCode}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Generate QR Code</span>
                    </button>
                    
                    {/* URL Display and Mobile Testing Info */}
                    {tryOnUrl && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <p className="text-white/80 text-sm font-medium mb-2">🔗 Client Access URL:</p>
                        <p className="text-white/60 text-xs font-mono break-all bg-black/20 p-2 rounded">{tryOnUrl}</p>
                        {tryOnUrl.includes('localhost') && (
                          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-yellow-400 text-xs font-medium">⚠️ Mobile Testing Issue</p>
                            <p className="text-yellow-300/80 text-xs mt-1">
                              This URL uses 'localhost' which won't work on mobile devices. 
                              For mobile testing, the QR code should use your network IP (like 192.168.1.190:3000).
                            </p>
                          </div>
                        )}
                        {tryOnUrl.includes('192.168') && (
                          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <p className="text-green-400 text-xs font-medium">✅ Mobile Ready</p>
                            <p className="text-green-300/80 text-xs mt-1">
                              This URL uses your network IP and will work on mobile devices on the same WiFi network.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {qrCodeUrl && (
                      <div className="flex space-x-3">
                        <button
                          onClick={downloadQRCode}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-all flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        
                        {tryOnUrl && (
                          <a
                            href={tryOnUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/20 transition-all flex items-center space-x-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Test</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  {qrCodeUrl ? (
                    <div className="bg-white p-6 rounded-2xl inline-block">
                      <img 
                        src={qrCodeUrl} 
                        alt="Salon QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                      <p className="text-gray-600 text-sm mt-2">{salon?.name}</p>
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-2xl p-12">
                      <QrCode className="w-16 h-16 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">Generate your QR code to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Analytics Coming Soon</h2>
              <p className="text-white/70">
                Detailed analytics and insights will be available in the next update.
              </p>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Session Management</h2>
              <button
                onClick={loadSessionsData}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Sessions Summary */}
            {sessionsSummary && (
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Total Sessions</p>
                      <p className="text-white text-2xl font-bold">{sessionsSummary.total_sessions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Active Sessions</p>
                      <p className="text-white text-2xl font-bold">{sessionsSummary.active_sessions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Images Generated</p>
                      <p className="text-white text-2xl font-bold">{sessionsSummary.total_generations}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Avg Duration</p>
                      <p className="text-white text-2xl font-bold">{sessionsSummary.avg_session_duration_minutes}m</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white">Recent Sessions</h3>
                <p className="text-white/60 text-sm mt-1">Track client sessions, usage, and activity</p>
              </div>

              {sessionsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-white/60">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">No sessions yet</p>
                  <p className="text-white/40 text-sm">Sessions will appear here when clients start using your QR code</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-white/80 font-medium">Session ID</th>
                        <th className="text-left p-4 text-white/80 font-medium">Start Time</th>
                        <th className="text-left p-4 text-white/80 font-medium">Duration</th>
                        <th className="text-left p-4 text-white/80 font-medium">Images Generated</th>
                        <th className="text-left p-4 text-white/80 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session, index) => (
                        <tr key={session.id} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                          <td className="p-4 text-white/90 font-mono text-sm">
                            {session.id.substring(0, 8)}...
                          </td>
                          <td className="p-4 text-white/80">
                            {new Date(session.start_time).toLocaleString()}
                          </td>
                          <td className="p-4 text-white/80">
                            {session.duration_minutes}m
                          </td>
                          <td className="p-4 text-white/80">
                            <span className="text-white text-lg font-semibold">{session.ai_uses_count}</span>
                            <span className="text-white/50 text-sm ml-1">images</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.is_active 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {session.is_active ? 'Active' : 'Ended'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Salon Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                  <div>
                    <h3 className="text-white font-medium">Salon Information</h3>
                    <p className="text-white/60 text-sm">Update your salon name and location</p>
                    {salon?.name && (
                      <div className="mt-2 text-sm text-white/80">
                        <p><strong>{salon.name}</strong></p>
                        {salon.city && <p>{salon.city}</p>}
                        {salon.address && <p>{salon.address}</p>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Pre-populate form with current salon data
                      setProfileForm({
                        name: salon?.name || '',
                        city: salon?.city || '',
                        address: salon?.address || ''
                      })
                      setShowProfileForm(true)
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                  <div>
                    <h3 className="text-white font-medium">Session Settings</h3>
                    <p className="text-white/60 text-sm">Configure client session limits</p>
                    <div className="mt-2 text-sm text-white/80">
                      <p>Duration: <strong>{salon?.session_duration || 30} minutes</strong></p>
                      <p>AI Uses: <strong>{salon?.max_ai_uses || 20} transformations</strong></p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Pre-populate form with current settings
                      setSettingsForm({
                        session_duration: salon?.session_duration || 30,
                        max_ai_uses: salon?.max_ai_uses || 20
                      })
                      setShowSettingsForm(true)
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Form Modal */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
              <button
                onClick={() => setShowProfileForm(false)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Salon Name *
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Your Salon Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Full Address"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Save Profile</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settings Form Modal */}
      {showSettingsForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Session Settings</h2>
              <button
                onClick={() => setShowSettingsForm(false)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Session Duration (minutes) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settingsForm.session_duration}
                  onChange={(e) => setSettingsForm({...settingsForm, session_duration: parseInt(e.target.value)})}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="30"
                />
                <p className="text-white/60 text-xs mt-1">How long clients can use the try-on (5-120 minutes)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  AI Transformations per Session *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settingsForm.max_ai_uses}
                  onChange={(e) => setSettingsForm({...settingsForm, max_ai_uses: parseInt(e.target.value)})}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="20"
                />
                <p className="text-white/60 text-xs mt-1">Maximum AI transformations per client (1-50 uses)</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-medium mb-2">💡 Recommendations:</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• <strong>Session Duration:</strong> 30-45 minutes for busy salons</li>
                  <li>• <strong>AI Uses:</strong> 15-25 transformations per client</li>
                  <li>• Higher limits = better client experience</li>
                  <li>• Lower limits = more efficient turnover</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Save Settings</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-md mx-auto text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Settings Updated!</h3>
            <p className="text-white/80 mb-6">
              Your session settings have been successfully updated and are now active for all new client sessions.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}