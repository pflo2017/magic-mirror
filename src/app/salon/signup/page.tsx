'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scissors, Users, BarChart3, QrCode, Eye, EyeOff, Mail } from 'lucide-react'

export default function SalonSignup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'info' | 'success' | 'verify_email'>('info')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        if (result.needs_confirmation) {
          setStep('verify_email')
        } else {
          setStep('success')
        }
      } else {
        alert(result.error || 'Signup failed')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
            <Link href="/salon/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Free Trial
          </h2>
          <p className="text-xl text-gray-600">
            Get 10 free AI hair transformations to try our platform
          </p>
        </div>

        {/* Salon Information Form */}
        {step === 'info' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-center">🎉 What you get for FREE:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  10 AI hair transformations
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Permanent QR code
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  30-minute sessions
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Basic analytics
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg disabled:bg-gray-400 flex items-center mx-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Start Free Trial'
                  )}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Email Verification Step */}
        {step === 'verify_email' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center">
            <div className="text-blue-500 text-6xl mb-6">
              <Mail className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
            <p className="text-xl text-gray-600 mb-8">
              We've sent a verification link to <strong>{formData.email}</strong>
            </p>
            
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Next Steps:</h3>
              <div className="text-left space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
                  <span>Check your email inbox (and spam folder)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
                  <span>Click the verification link in the email</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</div>
                  <span>You'll be redirected to your dashboard</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setStep('info')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back to Form
                </button>
                <Link
                  href="/salon/login"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block text-center"
                >
                  Already Verified? Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success Page */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center">
            <div className="text-green-500 text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to HairTryOn!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Your salon account has been created successfully.
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
                Go to Dashboard
              </Link>
              
              <div className="text-sm text-gray-600">
                <p>After using your 10 free transformations, you can upgrade to continue using the platform.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
