'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Camera, Upload, Sparkles, ArrowLeft, Download, Share2, Clock, RotateCcw, Palette } from 'lucide-react'

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
  logo?: string | null
}

export default function ClientTryOnInterface() {
  const params = useParams()
  const searchParams = useSearchParams()
  const salonId = params.salonId as string
  
  // Core state
  const [step, setStep] = useState<Step>('welcome')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  
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
  const [sessionTime, setSessionTime] = useState(15 * 60) // 15 minutes default
  const [creditsLeft, setCreditsLeft] = useState(5)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

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
    }
  }

  const loadSalonInfo = async () => {
    try {
      // Try to fetch salon info from database
      const response = await fetch(`/api/salon/info?salon_id=${salonId}`)
      
      if (response.ok) {
        const data = await response.json()
        setSalon({
          id: salonId,
          name: data.salon?.name || 'Magic Mirror Virtual Try-On',
          logo: data.salon?.logo || null
        })
      } else {
        // Fallback to default salon info
        setSalon({
          id: salonId,
          name: 'Magic Mirror Virtual Try-On',
          logo: null
        })
      }
    } catch (error) {
      console.error('Failed to load salon info:', error)
      // Fallback to default salon info
      setSalon({
        id: salonId,
        name: 'Magic Mirror Virtual Try-On',
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
    // For now, just trigger file input
    // In production, this would open camera
    document.getElementById('camera-input')?.click()
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
    setProcessingMessage('Uploading your photo...')
    
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
        
        if (result.job_id) {
          // Start polling for job status
          setCurrentJobId(result.job_id)
          setCreditsLeft(result.session.ai_uses_remaining)
          setSessionTime(result.session.time_remaining)
          pollJobStatus(result.job_id)
        } else {
          // Fallback to immediate result (for backward compatibility)
          setResultImage(result.generated_image_url)
          setCreditsLeft(result.session.ai_uses_remaining)
          setSessionTime(result.session.time_remaining)
          // Update selected style with prompt from API response
          if (result.style && result.style.prompt) {
            setSelectedStyle(prev => prev ? {...prev, prompt: result.style.prompt} : prev)
          }
          // Show AI status message
          if (result.ai_enabled) {
            setProcessingMessage('✨ AI Analysis & Transformation Complete!')
          } else {
            setProcessingMessage('📱 Demo Mode - Add GEMINI_API_KEY for AI analysis')
          }
          setStep('result')
        }
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

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60 // 5 minutes max (5s intervals)
    let attempts = 0
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/job/${jobId}`)
        
        if (response.ok) {
          const jobStatus = await response.json()
          
          setProcessingProgress(jobStatus.progress || 0)
          setProcessingMessage(jobStatus.message || 'Processing...')
          
          if (jobStatus.status === 'completed' && jobStatus.result?.generatedImageUrl) {
            setResultImage(jobStatus.result.generatedImageUrl)
            setCurrentJobId(null)
          setStep('result')
            return
          } else if (jobStatus.status === 'failed') {
            alert(jobStatus.message || 'Processing failed. Please try again.')
            setCurrentJobId(null)
            setStep('styles')
            return
          }
          
          // Continue polling if still processing
          if (attempts < maxAttempts && (jobStatus.status === 'queued' || jobStatus.status === 'processing')) {
            attempts++
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else if (attempts >= maxAttempts) {
            alert('Processing is taking longer than expected. Please try again.')
            setCurrentJobId(null)
            setStep('styles')
          }
        } else {
          throw new Error('Failed to get job status')
        }
      } catch (error) {
        console.error('Job polling error:', error)
        if (attempts < 3) {
          attempts++
          setTimeout(poll, 5000)
        } else {
          alert('Failed to check processing status. Please try again.')
          setCurrentJobId(null)
          setStep('styles')
        }
      }
    }
    
    // Start polling
    poll()
  }

  const tryAnotherStyle = () => {
    setSelectedStyle(null)
    setResultImage(null)
    setStep('styles')
  }

  const changeCategory = () => {
    setSelectedCategory(null)
    setSelectedStyle(null)
    setResultImage(null)
    setStep('category')
  }

  const downloadResult = () => {
    if (resultImage) {
      const link = document.createElement('a')
      link.href = resultImage
      link.download = `${salon?.name || 'salon'}-hairstyle-${selectedStyle?.name || 'result'}.png`
      link.click()
    }
  }

  const shareResult = async () => {
    if (resultImage && navigator.share) {
      try {
        await navigator.share({
          title: `My new look from ${salon?.name}`,
          text: `Check out my virtual hairstyle from ${salon?.name}!`,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copy link
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const resetSession = () => {
    setSelectedImage(null)
    setSelectedGender(null)
    setSelectedCategory(null)
    setSelectedStyle(null)
    setResultImage(null)
    setStep('welcome')
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Ended</h2>
          <p className="text-gray-600 mb-6">{sessionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start New Session
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header with salon branding and timer */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {salon?.logo && (
                <img src={salon.logo} alt={salon.name} className="w-8 h-8 rounded" />
              )}
            <div>
                <h1 className="text-lg font-bold text-gray-900">{salon?.name}</h1>
                <p className="text-sm text-gray-600">Virtual Hair Try-On</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(sessionTime)}
              </div>
              <div>{creditsLeft} tries left</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Step 1: Welcome */}
        {step === 'welcome' && (
          <div className="text-center space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to {salon?.name}!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Try your new haircut virtually before you decide
              </p>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">How it works:</h3>
                <div className="grid md:grid-cols-4 gap-4 text-left">
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-2">1</div>
                    <h4 className="font-medium">Take Photo</h4>
                    <p className="text-sm text-gray-600">Selfie or upload</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-2">2</div>
                    <h4 className="font-medium">Choose Gender</h4>
                    <p className="text-sm text-gray-600">Men or Women</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-2">3</div>
                    <h4 className="font-medium">Pick Style</h4>
                    <p className="text-sm text-gray-600">Browse options</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto mb-2">4</div>
                    <h4 className="font-medium">See Result</h4>
                    <p className="text-sm text-gray-600">AI magic!</p>
              </div>
                </div>
              </div>

              <button
                onClick={() => setStep('upload')}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors flex items-center mx-auto"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Virtual Try-On
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload Photo */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setStep('welcome')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-3xl font-bold text-center mb-8">Upload Your Photo</h2>
            
            <div className="max-w-md mx-auto space-y-6">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center">
                <Camera className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Take a Selfie</h3>
                <p className="text-gray-600 mb-4">Best results with good lighting</p>
                <button
                  onClick={handleCameraCapture}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Open Camera
                </button>
                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center text-gray-500">or</div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload from Gallery</h3>
                <p className="text-gray-600 mb-4">Choose an existing photo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="gallery-upload"
                />
                <label
                  htmlFor="gallery-upload"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer inline-block"
                >
                  Select Photo
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Choose Gender */}
        {step === 'gender' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setStep('upload')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Style Category</h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => selectGender('women')}
                className="bg-gradient-to-br from-pink-100 to-purple-100 border-2 border-transparent hover:border-purple-300 rounded-xl p-8 text-center transition-all transform hover:scale-105"
              >
                <div className="text-6xl mb-4">👩</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Women</h3>
                <p className="text-gray-600">Hairstyles & Colors</p>
              </button>

              <button
                onClick={() => selectGender('men')}
                className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-transparent hover:border-blue-300 rounded-xl p-8 text-center transition-all transform hover:scale-105"
              >
                <div className="text-6xl mb-4">👨</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Men</h3>
                <p className="text-gray-600">Hairstyles, Colors & Beards</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Choose Category */}
        {step === 'category' && selectedGender && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setStep('gender')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <h2 className="text-3xl font-bold text-center mb-8">
              What would you like to try?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <button
                onClick={() => selectCategory('hairstyles')}
                className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-transparent hover:border-purple-300 rounded-xl p-6 text-center transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-3">✂️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hairstyles</h3>
                <p className="text-gray-600">Different cuts & styles</p>
              </button>

              <button
                onClick={() => selectCategory('colors')}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-transparent hover:border-orange-300 rounded-xl p-6 text-center transition-all transform hover:scale-105"
              >
                <div className="text-4xl mb-3">🎨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hair Colors</h3>
                <p className="text-gray-600">Blonde, brunette, red & more</p>
              </button>

              {selectedGender === 'men' && (
                <button
                  onClick={() => selectCategory('beards')}
                  className="bg-gradient-to-br from-green-100 to-teal-100 border-2 border-transparent hover:border-green-300 rounded-xl p-6 text-center transition-all transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">🧔</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Beard Styles</h3>
                  <p className="text-gray-600">Full, goatee, stubble & more</p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Choose Style */}
        {step === 'styles' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <button
                onClick={() => setStep('category')}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-2xl font-bold text-center mb-6">
                Choose Your {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Style'}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {filteredStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => selectStyle(style)}
                    className="border-2 border-gray-200 hover:border-purple-300 rounded-lg p-4 text-left transition-all transform hover:scale-105"
                  >
                    <div className="bg-gray-200 rounded h-20 mb-3 overflow-hidden">
                      {style.image_url ? (
                      <img
                        src={style.image_url}
                        alt={style.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling!.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center" style={{display: style.image_url ? 'none' : 'flex'}}>
                        <Sparkles className="w-6 h-6 text-gray-500" />
                      </div>
                  </div>
                    <h4 className="font-semibold text-sm mb-1">{style.name}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{style.description}</p>
                  </button>
                ))}
              </div>

              {filteredStyles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading styles...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Processing */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              {processingProgress > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-purple-600">
                    {Math.round(processingProgress)}%
                  </span>
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Creating Your New Look</h2>
            <p className="text-gray-600 mb-2">
              Applying {selectedStyle?.name} to your photo...
            </p>
            <p className="text-sm text-gray-500 mb-4">{processingMessage}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${processingProgress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-400">
              {currentJobId && `Job ID: ${currentJobId}`}
            </p>
          </div>
        )}

        {/* Step 7: Result */}
        {step === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-center mb-6">Your New Look!</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-center">Before</h3>
                  <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center overflow-hidden">
                    {selectedImage ? (
                      <img src={selectedImage} alt="Original" className="max-h-full max-w-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-gray-500">Original photo</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-center">
                    After - {selectedStyle?.name}
                  </h3>
                  <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center overflow-hidden">
                    {resultImage ? (
                      <img src={resultImage} alt="Result" className="max-h-full max-w-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                        <p className="text-purple-700 font-medium">AI-Generated Result</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Prompt Display */}
              {selectedStyle && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">AI Transformation Details</h4>
                <button
                      onClick={() => setShowPrompt(!showPrompt)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                      {showPrompt ? 'Hide Details' : 'Show Details'}
                </button>
                  </div>
                  
                  {/* AI Status Indicator */}
                  <div className="text-xs text-gray-600 mb-2 flex items-center">
                    <span className="mr-2">{processingMessage}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Style:</strong> {selectedStyle.name} ({selectedStyle.category.replace('_', ' ')})
                  </div>
                  
                  {showPrompt && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong>AI Prompt:</strong> {
                          typeof selectedStyle.prompt === 'string' 
                            ? selectedStyle.prompt 
                            : selectedStyle.prompt?.instruction || 'No prompt available'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center space-y-4">
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={tryAnotherStyle}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Another Style
                  </button>
                
                  <button
                    onClick={changeCategory}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Change Category
                  </button>

                  {resultImage && (
                    <>
                      <button
                        onClick={downloadResult}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      
                      <button
                        onClick={shareResult}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </>
                )}
              </div>

                <div className="text-sm text-gray-600">
                  {creditsLeft > 0 ? `${creditsLeft} tries remaining` : 'No tries remaining'}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Love this look?</strong> Show this to your stylist - they can recreate it for you!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}