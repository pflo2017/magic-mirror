'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  QrCode, 
  Users, 
  Zap, 
  Check, 
  ArrowRight,
  Scissors,
  Palette,
  Clock,
  Shield,
  BarChart3,
  Star
} from 'lucide-react'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    description: 'Perfect for small salons getting started',
    features: [
      '20-minute sessions',
      '3 AI generations per session',
      'Up to 10 active sessions',
      'Basic QR code',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 59,
    description: 'Ideal for busy salons with regular clients',
    features: [
      '30-minute sessions',
      '5 AI generations per session',
      'Up to 25 active sessions',
      'Analytics dashboard',
      'Custom QR code',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    description: 'For high-end salons with premium service',
    features: [
      '60-minute sessions',
      '10 AI generations per session',
      'Up to 50 active sessions',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access'
    ]
  }
]

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState('professional')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Scissors className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">HairTryOn</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a>
              <a href="#demo" className="text-gray-600 hover:text-purple-600 transition-colors">Demo</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-purple-600 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Virtual Hair Try-On
              <span className="block text-purple-600">for Modern Salons</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your salon experience with AI-powered hair styling. Let clients try unlimited hairstyles, 
              colors, and beard styles instantly with just a QR code scan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#demo" className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything Your Salon Needs
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for hair salons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Permanent QR Code</h3>
              <p className="text-gray-600">
                One QR code that never changes. Print it once and clients can access your try-on experience forever.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Styling</h3>
              <p className="text-gray-600">
                Advanced AI generates realistic hair transformations in seconds, powered by Google Gemini.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Timed Sessions</h3>
              <p className="text-gray-600">
                Configurable session lengths with usage limits to manage salon traffic and costs.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">200+ Styles</h3>
              <p className="text-gray-600">
                Comprehensive library of hairstyles, colors, and beard styles for every client preference.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">
                Track popular styles, session analytics, and client preferences to optimize your service.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Client photos are processed securely and automatically deleted after sessions expire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your salon's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-purple-600 text-white shadow-2xl scale-105'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`mb-6 ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className={`text-lg ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                      /month
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className={`w-5 h-5 mr-3 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-bold">HairTryOn</span>
              </div>
              <p className="text-gray-400">
                Virtual hair try-on technology for modern salons.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HairTryOn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
