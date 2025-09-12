'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scissors, Camera, Upload, Sparkles, ArrowLeft, Download } from 'lucide-react'

export default function Demo() {
  const [step, setStep] = useState<'intro' | 'upload' | 'select' | 'result'>('intro')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Demo images for quick selection
  const demoImages = [
    { id: '1', url: '/demo/person1.jpg', alt: 'Demo Person 1' },
    { id: '2', url: '/demo/person2.jpg', alt: 'Demo Person 2' },
    { id: '3', url: '/demo/person3.jpg', alt: 'Demo Person 3' },
  ]

  // Demo styles
  const demoStyles = [
    { id: 'bob', name: 'Classic Bob', category: 'women', preview: '/demo/bob.jpg' },
    { id: 'pixie', name: 'Pixie Cut', category: 'women', preview: '/demo/pixie.jpg' },
    { id: 'layers', name: 'Long Layers', category: 'women', preview: '/demo/layers.jpg' },
    { id: 'fade', name: 'Modern Fade', category: 'men', preview: '/demo/fade.jpg' },
    { id: 'pompadour', name: 'Pompadour', category: 'men', preview: '/demo/pompadour.jpg' },
    { id: 'undercut', name: 'Undercut', category: 'men', preview: '/demo/undercut.jpg' },
  ]

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setStep('select')
  }

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
  }

  const applyStyle = () => {
    setIsProcessing(true)
    setStep('result')
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
    }, 3000)
  }

  const resetDemo = () => {
    setSelectedImage(null)
    setSelectedStyle(null)
    setStep('intro')
    setIsProcessing(false)
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
            <div className="flex items-center space-x-4">
              <Link href="/salon/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                For Salons
              </Link>
              <Link href="/salon/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Salon Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        {step === 'intro' && (
          <div className="text-center space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Try Our AI Hair Styling Demo
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Experience the magic of virtual hair transformations. See how our AI can instantly apply different hairstyles to any photo.
              </p>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">How it works:</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-medium">Choose a Photo</h4>
                      <p className="text-sm text-gray-600">Select from our demo images or upload your own</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-medium">Pick a Style</h4>
                      <p className="text-sm text-gray-600">Browse our collection of popular hairstyles</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-medium">See the Magic</h4>
                      <p className="text-sm text-gray-600">Watch AI transform the photo in seconds</p>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-6">Choose a Demo Photo</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {demoImages.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => handleImageSelect(image.url)}
                    className="cursor-pointer group"
                  >
                    <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                      <Camera className="w-12 h-12 text-gray-500" />
                      <span className="ml-2 text-gray-600">Demo Photo {image.id}</span>
                    </div>
                    <p className="text-center mt-2 text-sm text-gray-600">{image.alt}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('upload')}
                  className="mt-6 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center mx-auto"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your Own Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setStep('intro')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Demo Photos
            </button>

            <h2 className="text-3xl font-bold text-center mb-8">Upload Your Photo</h2>
            
            <div className="max-w-md mx-auto">
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Choose a Photo</h3>
                <p className="text-gray-600 mb-4">Upload a clear photo of your face for best results</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        handleImageSelect(e.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer inline-block"
                >
                  Select Photo
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Style Selection */}
        {step === 'select' && (
          <div className="space-y-8">
            <button
              onClick={() => setStep('intro')}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-center mb-8">Choose Your Style</h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Photo</h3>
                  <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                    {selectedImage ? (
                      <img src={selectedImage} alt="Selected" className="max-h-full max-w-full rounded-xl" />
                    ) : (
                      <span className="text-gray-500">Selected photo will appear here</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Available Styles</h3>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {demoStyles.map((style) => (
                      <div
                        key={style.id}
                        onClick={() => handleStyleSelect(style.id)}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedStyle === style.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="bg-gray-200 rounded h-16 mb-2 flex items-center justify-center">
                          <Scissors className="w-6 h-6 text-gray-500" />
                        </div>
                        <h4 className="font-medium text-sm">{style.name}</h4>
                        <p className="text-xs text-gray-600 capitalize">{style.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedStyle && (
                <div className="text-center">
                  <button
                    onClick={applyStyle}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center mx-auto"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Apply Style
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        {step === 'result' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {isProcessing ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
                  <h2 className="text-2xl font-bold mb-4">Creating Your New Look</h2>
                  <p className="text-gray-600">Our AI is applying the style to your photo...</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-3xl font-bold text-center mb-8">Your New Look!</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">Before</h3>
                      <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                        {selectedImage ? (
                          <img src={selectedImage} alt="Original" className="max-h-full max-w-full rounded-xl" />
                        ) : (
                          <span className="text-gray-500">Original photo</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        After - {demoStyles.find(s => s.id === selectedStyle)?.name}
                      </h3>
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl h-64 flex items-center justify-center">
                        <div className="text-center">
                          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                          <p className="text-purple-700 font-medium">AI-Generated Result</p>
                          <p className="text-sm text-purple-600">This is a demo preview</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="flex flex-wrap justify-center gap-4">
                      <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        Download Result
                      </button>
                      <button
                        onClick={resetDemo}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Try Another Style
                      </button>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mt-8">
                      <h3 className="text-xl font-bold mb-4">Ready to offer this to your clients?</h3>
                      <p className="text-gray-700 mb-6">
                        This is just a demo! The real HairTryOn platform provides salon owners with:
                      </p>
                      <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                          Real AI-powered hair transformations
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                          Permanent QR codes for your salon
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                          Session management and analytics
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                          200+ professional hairstyles
                        </li>
                      </ul>
                      <Link
                        href="/salon/signup"
                        className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold inline-block"
                      >
                        Start Your Free Trial
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


