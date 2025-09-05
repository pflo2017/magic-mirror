'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Camera, Upload, Sparkles, ArrowLeft, Download, Share2, Clock, RotateCcw, Palette, User, Scissors, ChevronRight, ChevronDown, Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface Style {
  id: string
  name: string
  category: string
  description: string
  prompt: any
  image_url?: string
}

type Gender = 'women' | 'men'
type Category = 'hairstyles' | 'colors' | 'beards'
type Step = 'welcome' | 'upload' | 'gender' | 'category' | 'styles' | 'processing' | 'result'

interface SalonInfo {
  id: string
  name: string
  city?: string
  address?: string
  logo?: string | null
}

export default function ClientTryOnInterface() {
  const params = useParams()
  const salonId = params.salonId as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  
  // Core state
  const [step, setStep] = useState<Step>('welcome')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [aiPromptUsed, setAiPromptUsed] = useState<string | null>(null)
  
  // Async processing state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingMessage, setProcessingMessage] = useState('Creating your new look...')
  
  // Data state
  const [salon, setSalon] = useState<SalonInfo | null>(null)
  const [styles, setStyles] = useState<Style[]>([])
  const [filteredStyles, setFilteredStyles] = useState<Style[]>([])
  
  // Session state
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionTime, setSessionTime] = useState(15 * 60)
  const [creditsLeft, setCreditsLeft] = useState(5)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Mobile UX state
  const [isLoading, setIsLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  // Initialize session and load salon data
  useEffect(() => {
    initializeSession()
    loadSalonInfo()
    loadStyles()
  }, [salonId])

  // Filter styles based on gender and category
  useEffect(() => {
    if (selectedGender && selectedCategory) {
      const categoryKey = `${selectedGender}_${selectedCategory}`
      const filtered = styles.filter(style => style.category === categoryKey)
      setFilteredStyles(filtered)
    }
  }, [selectedGender, selectedCategory, styles])

  // Session timer
  useEffect(() => {
    if (sessionToken && sessionTime > 0) {
      const timer = setInterval(() => {
        setSessionTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setSessionError('Session expired! Please ask your stylist for a new QR code.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [sessionToken, sessionTime])

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salon_id: salonId })
      })

      if (response.ok) {
        const data = await response.json()
        setSessionToken(data.session_token)
        setCreditsLeft(data.max_ai_uses)
        setSessionTime(data.session_duration * 60 || 15 * 60)
      } else {
        setSessionError('Failed to start session')
      }
    } catch (error) {
      console.error('Session initialization error:', error)
      setSessionError('Failed to start session')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSalonInfo = async () => {
    try {
      const response = await fetch(`/api/salon/info?salon_id=${salonId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSalon({
          id: salonId,
          name: data.salon?.name || 'Magic Mirror',
          city: data.salon?.city,
          address: data.salon?.address,
          logo: data.salon?.logo || null
        })
      } else {
        setSalon({
          id: salonId,
          name: 'Magic Mirror',
          logo: null
        })
      }
    } catch (error) {
      console.error('Failed to load salon info:', error)
      setSalon({
        id: salonId,
        name: 'Magic Mirror',
        logo: null
      })
    }
  }

  const loadStyles = async () => {
    try {
      const response = await fetch('/api/styles')
      if (response.ok) {
        const data = await response.json()
        setStyles(data.styles || [])
      }
    } catch (error) {
      console.error('Failed to load styles:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setStep('gender')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    fileInputRef.current?.click()
  }

  const selectGender = (gender: Gender) => {
    setSelectedGender(gender)
    setStep('category')
  }

  const selectCategory = (category: Category) => {
    setSelectedCategory(category)
    setStep('styles')
  }

  const selectStyle = (style: Style) => {
    setSelectedStyle(style)
    applyStyle(style)
  }

  const applyStyle = async (style: Style) => {
    if (!selectedImage || !sessionToken) return

    setIsProcessing(true)
    setStep('processing')
    setProcessingProgress(0)
    setProcessingMessage('Analyzing your photo...')
    
    try {
      const response = await fetch('/api/session/apply-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken,
          style_id: style.id,
          image_url: selectedImage
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        setResultImage(result.generated_image_url)
        setCreditsLeft(result.session.ai_uses_remaining)
        setSessionTime(result.session.time_remaining)
        
        if (result.style && result.style.prompt) {
          setSelectedStyle(prev => prev ? {...prev, prompt: result.style.prompt} : prev)
        }
        
        // Store the AI prompt that was actually used for debugging
        if (result.ai_status?.prompt_used) {
          setAiPromptUsed(result.ai_status.prompt_used)
        }
        
        if (result.ai_status?.used_ai) {
          setProcessingMessage('✨ AI transformation complete!')
        } else {
          setProcessingMessage('📱 Demo transformation complete')
        }
        
        setTimeout(() => setStep('result'), 1000)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to process image. Please try again.')
        setStep('styles')
      }
    } catch (error) {
      console.error('Processing error:', error)
      alert('Failed to process image. Please try again.')
      setStep('styles')
    } finally {
      setIsProcessing(false)
    }
  }

  const goBack = () => {
    switch (step) {
      case 'gender':
        setStep('upload')
        break
      case 'category':
        setStep('gender')
        break
      case 'styles':
        setStep('category')
        break
      case 'result':
        setStep('styles')
        break
      default:
        setStep('welcome')
    }
  }

  const resetSession = () => {
    setSelectedImage(null)
    setSelectedGender(null)
    setSelectedCategory(null)
    setSelectedStyle(null)
    setResultImage(null)
    setAiPromptUsed(null)
    setShowPrompt(false)
    setStep('welcome')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/80">Loading Magic Mirror...</p>
        </div>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Session Expired</h2>
          <p className="text-white/70 mb-6">{sessionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Status Bar */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-2">
            {step !== 'welcome' && (
              <button
                onClick={goBack}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-white font-semibold text-lg">{salon?.name}</h1>
              {salon?.city && (
                <p className="text-white/60 text-sm">{salon.city}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {sessionToken && (
              <>
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm font-medium">{creditsLeft}</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium">{formatTime(sessionTime)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-8">
        <div className="max-w-md mx-auto">
          
          {/* Welcome Step */}
          {step === 'welcome' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Try New Hairstyles
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                See how you'll look with different hairstyles and colors before your appointment
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <span className="text-white/90">Take or upload a selfie</span>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <span className="text-white/90">Choose your style preferences</span>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <span className="text-white/90">See your AI transformation</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('upload')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Take Your Photo</h2>
                <p className="text-white/70">For best results, face the camera directly with good lighting</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCameraCapture}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-2xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-3"
                >
                  <Camera className="w-8 h-8" />
                  <span>Take Photo</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900 text-white/60">or</span>
                  </div>
                </div>

                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 text-white py-6 rounded-2xl font-medium hover:bg-white/20 transition-all flex items-center justify-center space-x-3"
                >
                  <Upload className="w-6 h-6" />
                  <span>Upload from Gallery</span>
                </button>
              </div>

              {/* Camera input - opens camera */}
              <input
                ref={fileInputRef}
                id="camera-input"
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {/* Gallery input - opens photo library */}
              <input
                ref={galleryInputRef}
                id="gallery-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-medium mb-2">📸 Photo Tips:</h3>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Face the camera directly</li>
                  <li>• Use good lighting</li>
                  <li>• Keep hair visible and unobstructed</li>
                  <li>• Remove hats or accessories</li>
                </ul>
              </div>
            </div>
          )}

          {/* Gender Selection */}
          {step === 'gender' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Style Category</h2>
                <p className="text-white/70">This helps us show you the most relevant styles</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => selectGender('women')}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold text-lg">Women's Styles</h3>
                      <p className="text-white/60">Hairstyles, colors, and cuts for women</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => selectGender('men')}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold text-lg">Men's Styles</h3>
                      <p className="text-white/60">Hairstyles, colors, and beards for men</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Category Selection */}
          {step === 'category' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">What Would You Like to Try?</h2>
                <p className="text-white/70">Choose the type of transformation you want</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => selectCategory('hairstyles')}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Scissors className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold text-lg">Hairstyles</h3>
                      <p className="text-white/60">Different cuts, lengths, and styles</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </button>

                <button
                  onClick={() => selectCategory('colors')}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Palette className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-white font-semibold text-lg">Hair Colors</h3>
                      <p className="text-white/60">Blonde, brunette, red, and more</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </button>

                {selectedGender === 'men' && (
                  <button
                    onClick={() => selectCategory('beards')}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-white font-semibold text-lg">Beard Styles</h3>
                        <p className="text-white/60">Full beard, goatee, mustache</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Styles Selection */}
          {step === 'styles' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Style</h2>
                <p className="text-white/70">Tap any style to see how it looks on you</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {filteredStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => selectStyle(style)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl mb-3 flex items-center justify-center">
                      {style.image_url ? (
                        <img 
                          src={style.image_url} 
                          alt={style.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Sparkles className="w-8 h-8 text-white/60" />
                      )}
                    </div>
                    <h3 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">
                      {style.name}
                    </h3>
                  </button>
                ))}
              </div>

              {filteredStyles.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white/60" />
                  </div>
                  <p className="text-white/70">No styles available for this category yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="py-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-spin">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Creating Your New Look</h2>
              <p className="text-white/70 mb-8">{processingMessage}</p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Your New Look!</h2>
                <p className="text-white/70">How do you like your transformation?</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Before */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    {selectedImage && (
                      <img 
                        src={selectedImage} 
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-white/70 text-center text-sm">Before</p>
                </div>

                {/* After */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3">
                    {resultImage && (
                      <img 
                        src={resultImage} 
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-white/70 text-center text-sm">After</p>
                </div>
              </div>

              {/* AI Prompt Display */}
              {aiPromptUsed && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">AI Prompt Used</h3>
                    <button
                      onClick={() => setShowPrompt(!showPrompt)}
                      className="text-white/60 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {showPrompt ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showPrompt && (
                    <div className="bg-black/20 rounded-lg p-3 text-white/80 text-xs font-mono leading-relaxed max-h-32 overflow-y-auto">
                      {aiPromptUsed}
                    </div>
                  )}
                </div>
              )}

              {/* AI Prompt Display */}
              {(selectedStyle?.prompt || aiPromptUsed) && (
                <div className="mb-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
                  >
                    <span className="text-sm font-medium">🤖 AI Prompt Used</span>
                    <span className="text-xs">{showPrompt ? '▲' : '▼'}</span>
                  </button>
                  
                  {showPrompt && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-white/60 text-xs leading-relaxed">
                          {(() => {
                            // Show only the user-friendly instruction, not the technical AI prompt
                            if (selectedStyle?.prompt) {
                              let instruction;
                              
                              // Handle different input types (same logic as backend)
                              if (typeof selectedStyle.prompt === 'object') {
                                instruction = selectedStyle.prompt.instruction || selectedStyle.prompt.prompt || 'No instruction available';
                              } else if (typeof selectedStyle.prompt === 'string') {
                                try {
                                  const parsed = JSON.parse(selectedStyle.prompt);
                                  instruction = parsed.instruction || parsed.prompt || selectedStyle.prompt;
                                  
                                  // Handle double-nested instruction objects
                                  if (typeof instruction === 'object' && instruction.instruction) {
                                    instruction = instruction.instruction;
                                  }
                                } catch {
                                  instruction = selectedStyle.prompt;
                                }
                              }
                              
                              // Ensure we always return a string
                              if (typeof instruction !== 'string') {
                                instruction = JSON.stringify(instruction);
                              }
                              
                              return instruction;
                            }
                            return 'No style selected';
                          })()}
                        </p>
                      </div>
                      <p className="text-white/40 text-xs mt-2">
                        Style: {selectedStyle?.name} • Category: {selectedStyle?.category}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => setStep('styles')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Try Another Style</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  
                  <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center space-x-2">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>

                <button
                  onClick={resetSession}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}