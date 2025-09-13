'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, Upload, Sparkles, ArrowLeft, Share2, Clock, RotateCcw, Palette, User, Scissors, ChevronRight, X, Maximize2 } from 'lucide-react'

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
type Step = 'welcome' | 'upload' | 'gender' | 'category' | 'styles' | 'processing' | 'result' | 'credits-exhausted'

export default function IndividualTryOnInterface() {
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
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImage, setModalImage] = useState<{src: string, alt: string} | null>(null)
  
  // Async processing state
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingMessage, setProcessingMessage] = useState('Creating your new look...')
  
  // Data state
  const [styles, setStyles] = useState<Style[]>([])
  const [filteredStyles, setFilteredStyles] = useState<Style[]>([])
  
  // Session state
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionTime, setSessionTime] = useState(30 * 60) // 30 minutes for individual users
  const [creditsLeft, setCreditsLeft] = useState(5) // 5 free tries for individual users
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  // Mobile UX state
  const [isLoading, setIsLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)

  // Initialize session and load data
  useEffect(() => {
    initializeSession()
    loadStyles()
  }, [])

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
            setSessionError('Session expired! Please refresh to start a new session.')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [sessionToken, sessionTime])

  // Keyboard event listener for ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showImageModal) {
          closeImageModal()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showImageModal])

  const initializeSession = async () => {
    try {
      // Check if there's an existing individual session
      const storedSessionData = localStorage.getItem('b2c_session')
      
      if (storedSessionData) {
        try {
          const sessionData = JSON.parse(storedSessionData)
          console.log('🔍 Found existing individual session, validating...', sessionData.session_token.substring(0, 8) + '...')
          
          // Validate the existing session
          const validateResponse = await fetch('/api/individual/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: sessionData.session_token })
          })
          
          if (validateResponse.ok) {
            const validationData = await validateResponse.json()
            console.log('✅ Existing individual session is valid, resuming...', {
              credits_remaining: validationData.session.ai_uses_remaining,
              time_remaining: validationData.session.time_remaining
            })
            
            // Resume existing session
            setSessionToken(sessionData.session_token)
            setCreditsLeft(validationData.session.ai_uses_remaining)
            setSessionTime(validationData.session.time_remaining)
            setIsLoading(false)
            return
          } else {
            console.log('❌ Existing individual session invalid, creating new one...')
            localStorage.removeItem('b2c_session')
          }
        } catch (parseError) {
          console.log('⚠️ Invalid individual session data in localStorage, clearing...')
          localStorage.removeItem('b2c_session')
        }
      }
      
      // Create new individual session
      console.log('🆕 Creating new individual session...')
      const response = await fetch('/api/individual/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: 'individual' })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔄 New individual session created:', {
          session_id: data.session_token.substring(0, 8) + '...',
          max_ai_uses: data.max_ai_uses,
          session_duration: data.session_duration
        })
        
        // Store session data in localStorage for persistence
        const sessionData = {
          session_token: data.session_token,
          user_type: 'individual',
          created_at: new Date().toISOString(),
          expires_at: data.expires_at
        }
        localStorage.setItem('b2c_session', JSON.stringify(sessionData))
        
        setSessionToken(data.session_token)
        setCreditsLeft(data.max_ai_uses)
        setSessionTime(data.session_duration * 60 || 30 * 60)
      } else {
        const errorData = await response.json()
        console.error('Individual session start failed:', errorData)
        setSessionError('Failed to start session')
      }
    } catch (error) {
      console.error('Individual session initialization error:', error)
      setSessionError('Failed to start session')
    } finally {
      setIsLoading(false)
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
      const response = await fetch('/api/individual/apply-style', {
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
        
        // Update session token if a new one is provided
        if (result.new_session_token) {
          setSessionToken(result.new_session_token)
          
          // Update localStorage with new token
          const sessionData = {
            session_token: result.new_session_token,
            user_type: 'individual',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + result.session.time_remaining * 1000).toISOString()
          }
          localStorage.setItem('b2c_session', JSON.stringify(sessionData))
        }
        
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
        
        // Handle credits exhausted (403 error)
        if (response.status === 403 && errorData.error?.includes('No AI uses remaining')) {
          setStep('credits-exhausted')
        } else {
          alert(errorData.error || 'Failed to process image. Please try again.')
          setStep('styles')
        }
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
    setShowImageModal(false)
    setModalImage(null)
    setStep('welcome')
  }

  // Image expansion functionality
  const openImageModal = (src: string, alt: string) => {
    setModalImage({ src, alt })
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setModalImage(null)
  }

  // Save to photo gallery functionality
  const saveToGallery = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary image element to simulate the long-press behavior
      const tempImg = document.createElement('img')
      tempImg.src = url
      tempImg.style.position = 'fixed'
      tempImg.style.top = '50%'
      tempImg.style.left = '50%'
      tempImg.style.transform = 'translate(-50%, -50%)'
      tempImg.style.maxWidth = '90vw'
      tempImg.style.maxHeight = '90vh'
      tempImg.style.zIndex = '10000'
      tempImg.style.backgroundColor = 'white'
      tempImg.style.padding = '10px'
      tempImg.style.borderRadius = '10px'
      tempImg.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      
      // Create overlay
      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100%'
      overlay.style.height = '100%'
      overlay.style.backgroundColor = 'rgba(0,0,0,0.8)'
      overlay.style.zIndex = '9999'
      overlay.style.display = 'flex'
      overlay.style.alignItems = 'center'
      overlay.style.justifyContent = 'center'
      
      // Add close instruction
      const instruction = document.createElement('div')
      instruction.innerHTML = '📱 Hold and press the image to save or share<br/>Use your device\'s built-in options<br/>Tap outside to close'
      instruction.style.position = 'absolute'
      instruction.style.bottom = '40px'
      instruction.style.left = '50%'
      instruction.style.transform = 'translateX(-50%)'
      instruction.style.color = 'white'
      instruction.style.textAlign = 'center'
      instruction.style.fontSize = '16px'
      instruction.style.fontWeight = 'bold'
      instruction.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)'
      instruction.style.backgroundColor = 'rgba(0,0,0,0.8)'
      instruction.style.padding = '16px 24px'
      instruction.style.borderRadius = '16px'
      instruction.style.backdropFilter = 'blur(10px)'
      instruction.style.border = '1px solid rgba(255,255,255,0.2)'
      instruction.style.zIndex = '10001'
      instruction.style.maxWidth = '90vw'
      instruction.style.boxSizing = 'border-box'
      
      // Add elements to page
      document.body.appendChild(overlay)
      overlay.appendChild(tempImg)
      overlay.appendChild(instruction)
      
      // Close when clicking outside the image
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay)
          window.URL.revokeObjectURL(url)
        }
      })
      
      // Close when pressing escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.body.removeChild(overlay)
          window.URL.revokeObjectURL(url)
          document.removeEventListener('keydown', handleEscape)
        }
      }
      document.addEventListener('keydown', handleEscape)
      
      // Prevent image drag
      tempImg.addEventListener('dragstart', (e) => e.preventDefault())
      
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to load image. Please try again.')
    }
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
            Start New Session
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
              <h1 className="text-white font-semibold text-lg">Magic Mirror</h1>
              <p className="text-white/60 text-sm">Individual Try-On</p>
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
                Discover your perfect look with AI-powered hair styling. Try different cuts, colors, and styles instantly!
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

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/90 font-medium">✨ Free Session</span>
                  <span className="text-purple-300 font-bold">5 AI tries</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/90 font-medium">⏰ Session Time</span>
                  <span className="text-blue-300 font-bold">30 minutes</span>
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
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src="/icons/women_profile.svg" 
                        alt="Women's Profile" 
                        className="w-10 h-10"
                      />
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
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src="/icons/men_profile.svg" 
                        alt="Men's Profile" 
                        className="w-10 h-10"
                      />
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
                      {/* Hair Color Swatch */}
                      {(style.category === 'women_colors' || style.category === 'men_colors') && style.prompt?.hex_color ? (
                        <div className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden">
                          <div 
                            className="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg"
                            style={{ backgroundColor: style.prompt.hex_color }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl" />
                        </div>
                      ) : style.image_url ? (
                        <img 
                          src={style.image_url} 
                          alt={style.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        // Try to load preview image, fallback to sparkle icon
                        <img 
                          src={`/hairstyle-previews/${style.category === 'women_hairstyles' ? 'women' : style.category === 'men_hairstyles' ? 'men' : ''}/${style.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`}
                          alt={style.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            // If image fails to load, replace with sparkle icon
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              const sparkleDiv = document.createElement('div');
                              sparkleDiv.className = 'w-full h-full flex items-center justify-center';
                              sparkleDiv.innerHTML = '<svg class="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>';
                              parent.appendChild(sparkleDiv);
                            }
                          }}
                        />
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

              <div className="grid grid-cols-2 gap-4 mb-8 items-start">
                {/* Original */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div 
                    className="rounded-xl overflow-hidden mb-3 cursor-pointer relative group bg-black/10"
                    onClick={() => selectedImage && openImageModal(selectedImage, 'Original')}
                  >
                    {selectedImage && (
                      <>
                        <img 
                          src={selectedImage} 
                          alt="Original"
                          className="w-full h-64 md:h-80 object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-white/70 text-center text-sm">Original</p>
                </div>

                {/* New Look */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div 
                    className="rounded-xl overflow-hidden mb-3 cursor-pointer relative group bg-black/10"
                    onClick={() => resultImage && openImageModal(resultImage, 'New Look')}
                  >
                    {resultImage && (
                      <>
                        <img 
                          src={resultImage} 
                          alt="New Look"
                          className="w-full h-64 md:h-80 object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-6 h-6 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-white/70 text-center text-sm">New Look</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setStep('styles')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Try Another Style</span>
                </button>

                <button 
                  onClick={() => resultImage && saveToGallery(resultImage)}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-4 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Save & Share</span>
                </button>

                <button
                  onClick={resetSession}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-all"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          {/* Credits Exhausted Step */}
          {step === 'credits-exhausted' && (
            <div className="py-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Free Credits Used!</h2>
                <p className="text-white/70 mb-4">You've used all your free AI transformations.</p>
                <p className="text-white/60 text-sm">Create an account to get more credits and unlock premium features!</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Individual Packages</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white">10 AI Transformations</span>
                    <span className="text-purple-400 font-semibold">$2.99</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white">20 AI Transformations</span>
                    <span className="text-purple-400 font-semibold">$5.99</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-purple-500/30">
                    <span className="text-white">40 AI Transformations</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">POPULAR</span>
                      <span className="text-purple-400 font-semibold">$9.99</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white">100 AI Transformations</span>
                    <span className="text-purple-400 font-semibold">$19.99</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    // TODO: Implement registration/payment flow
                    alert('Registration and payment flow coming soon!')
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Create Account & Get Credits</span>
                </button>

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

      {/* Image Modal */}
      {showImageModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Top Bar with Back Button */}
            <div className="absolute -top-16 left-0 right-0 flex items-center justify-between">
              <button
                onClick={closeImageModal}
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <button
                onClick={closeImageModal}
                className="text-white hover:text-gray-300 transition-colors bg-black/50 backdrop-blur-sm rounded-lg p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <img
              src={modalImage.src}
              alt={modalImage.alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {/* Bottom Label */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-white text-sm font-medium">{modalImage.alt}</p>
            </div>
            
            {/* Mobile: Tap anywhere instruction */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 md:hidden">
              <p className="text-white text-xs opacity-75">Tap anywhere to close</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
