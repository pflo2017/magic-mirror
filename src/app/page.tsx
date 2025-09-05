'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Sparkles, Scissors, Users, TrendingUp, Star, ArrowRight, Play } from 'lucide-react'

// Sample transformation data for the animated showcase
const transformations = {
  female: [
    {
      before: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      after: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face",
      style: "Long Waves"
    },
    {
      before: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      after: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop&crop=face",
      style: "Classic Bob"
    },
    {
      before: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300&h=300&fit=crop&crop=face",
      after: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face",
      style: "Pixie Cut"
    }
  ],
  male: [
    {
      before: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      after: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      style: "Modern Fade"
    },
    {
      before: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      after: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face",
      style: "Textured Crop"
    },
    {
      before: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face",
      after: "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?w=300&h=300&fit=crop&crop=face",
      style: "Classic Side Part"
    }
  ]
}

function AnimatedShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [activeGender, setActiveGender] = useState<'female' | 'male'>('female')

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % transformations[activeGender].length)
        setIsTransitioning(false)
      }, 500)
    }, 3000)

    return () => clearInterval(interval)
  }, [activeGender])

  const currentTransformation = transformations[activeGender][currentIndex]

  return (
    <div className="relative">
      {/* Gender Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
          <button
            onClick={() => setActiveGender('female')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeGender === 'female'
                ? 'bg-white text-purple-600 shadow-lg'
                : 'text-white hover:text-purple-200'
            }`}
          >
            Female
          </button>
          <button
            onClick={() => setActiveGender('male')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeGender === 'male'
                ? 'bg-white text-purple-600 shadow-lg'
                : 'text-white hover:text-purple-200'
            }`}
          >
            Male
          </button>
        </div>
      </div>

      {/* Transformation Showcase */}
      <div className="flex items-center justify-center space-x-8">
        {/* Before Image */}
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
            <img
              src={currentTransformation.before}
              alt="Before"
              className={`w-full h-full object-cover transition-all duration-500 ${
                isTransitioning ? 'scale-110 blur-sm' : 'scale-100 blur-0'
              }`}
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
            Before
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <ArrowRight className="w-8 h-8 text-white/80 animate-pulse" />
          <div className="mt-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium">
            AI Magic
          </div>
        </div>

        {/* After Image */}
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
            <img
              src={currentTransformation.after}
              alt="After"
              className={`w-full h-full object-cover transition-all duration-500 ${
                isTransitioning ? 'scale-110 blur-sm' : 'scale-100 blur-0'
              }`}
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-medium text-purple-600 shadow-lg">
            After
          </div>
        </div>
      </div>

      {/* Style Name */}
      <div className="text-center mt-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-block border border-white/20">
          <span className="text-white font-medium">{currentTransformation.style}</span>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {transformations[activeGender].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <div className="absolute inset-0 h-8 w-8 text-purple-400 animate-pulse opacity-50">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Magic Mirror
          </span>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/salon/login" 
            className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/salon/signup" 
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="text-center lg:text-left">
              {/* Social Proof Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="flex -space-x-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">Trusted by 500+ salons</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Stop Losing Clients to{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  "Haircut Regret"
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/80 mb-6 leading-relaxed">
                Salon owners using Magic Mirror see{' '}
                <span className="text-purple-300 font-semibold">40% fewer refund requests</span> and{' '}
                <span className="text-pink-300 font-semibold">60% more repeat bookings</span>.
              </p>
              
              <p className="text-lg text-white/70 mb-8">
                Show clients exactly how they'll look before you cut.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link 
                  href="/salon/signup" 
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 font-semibold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group px-8 py-4 border-2 border-white/30 text-white rounded-full hover:bg-white/10 font-semibold text-lg transition-all backdrop-blur-sm flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white">40%</div>
                  <div className="text-white/60 text-sm">Fewer Refunds</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white">60%</div>
                  <div className="text-white/60 text-sm">More Bookings</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
                  <div className="text-white/60 text-sm">Happy Salons</div>
                </div>
              </div>
            </div>

            {/* Right Column - Animated Showcase */}
            <div className="relative">
              <AnimatedShowcase />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Salons Choose Magic Mirror
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              The complete AI-powered solution for modern salons
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Scissors className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">AI Hair Previews</h3>
              <p className="text-white/70">Show clients realistic previews of any hairstyle before cutting with advanced AI technology</p>
            </div>
            
            <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">QR Code Access</h3>
              <p className="text-white/70">Clients scan your unique QR code to try hairstyles instantly on their phones</p>
            </div>
            
            <div className="group text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Boost Revenue</h3>
              <p className="text-white/70">Increase client satisfaction and reduce refund requests significantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30"></div>
        <div className="relative max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Salon?
          </h2>
          <p className="text-xl mb-8 text-white/80">
            Join hundreds of salons already using Magic Mirror to delight their clients
          </p>
          <Link 
            href="/salon/signup" 
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-full hover:bg-gray-100 font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}