'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Users, BarChart3, QrCode, Eye, EyeOff, Mail, CheckCircle, ArrowRight } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl"></div>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <div className="absolute inset-0 h-8 w-8 text-purple-400 animate-pulse opacity-50">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Magic Mirror
          </span>
        </Link>
        <Link 
          href="/salon/login" 
          className="text-white/80 hover:text-white font-medium transition-colors"
        >
          Already have an account? Sign in
        </Link>
      </nav>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start Your Free Trial
          </h2>
          <p className="text-xl text-white/80">
            Get 10 free AI hair transformations to try our platform
          </p>
        </div>

        {/* Salon Information Form */}
        {step === 'info' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-2xl mx-auto">
            {/* Free Trial Benefits */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-center text-white">🎉 What you get for FREE:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  10 AI hair transformations
                </div>
                <div className="flex items-center text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  Permanent QR code
                </div>
                <div className="flex items-center text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  30-minute sessions
                </div>
                <div className="flex items-center text-white/90">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  Basic analytics
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 font-semibold text-lg transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-sm text-white/60 mt-4">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Email Verification Step */}
        {step === 'verify_email' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Check Your Email!</h2>
            <p className="text-xl text-white/80 mb-8">
              We've sent a verification link to <strong className="text-purple-300">{formData.email}</strong>
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-white">Next Steps:</h3>
              <div className="text-left space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
                  <span className="text-white/90">Check your email inbox (and spam folder)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
                  <span className="text-white/90">Click the verification link in the email</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</div>
                  <span className="text-white/90">You'll be redirected to your dashboard</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setStep('info')}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all"
                >
                  Back to Form
                </button>
                <Link
                  href="/salon/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all inline-block text-center"
                >
                  Already Verified? Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Success Page */}
        {step === 'success' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to Magic Mirror!</h2>
            <p className="text-xl text-white/80 mb-8">
              Your salon account has been created successfully.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-white">Your Free Trial Includes:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">10</span>
                  </div>
                  <span className="text-white/90">Free AI hair transformations</span>
                </div>
                <div className="flex items-center">
                  <QrCode className="w-10 h-10 text-purple-400 mr-3" />
                  <span className="text-white/90">Your permanent QR code</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-10 h-10 text-blue-400 mr-3" />
                  <span className="text-white/90">30-minute client sessions</span>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="w-10 h-10 text-orange-400 mr-3" />
                  <span className="text-white/90">Basic usage analytics</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="group inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full hover:from-purple-700 hover:to-pink-700 font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="text-sm text-white/60">
                <p>After using your 10 free transformations, you can upgrade to continue using the platform.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}