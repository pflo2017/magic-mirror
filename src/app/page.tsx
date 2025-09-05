import Link from "next/link";
import { Scissors, QrCode, Sparkles, Users, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Magic Mirror</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/salon/signup" className="text-gray-600 hover:text-purple-600 transition-colors">
                For Salons
              </Link>
              <Link href="/demo" className="text-gray-600 hover:text-purple-600 transition-colors">
                Demo
              </Link>
              <Link href="/salon/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Salon Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Virtual Hair Try-On for
            <span className="text-purple-600"> Modern Salons</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your salon experience with AI-powered hair styling. Clients scan your QR code, 
            try different hairstyles instantly, and make confident decisions before the cut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/salon/signup" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
              Start Free Trial
            </Link>
            <Link href="/demo" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything Your Salon Needs
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <QrCode className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Permanent QR Codes</h4>
              <p className="text-gray-600">One QR code per salon. Print it once, use it forever. Clients scan and start trying styles immediately.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Sparkles className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">AI-Powered Styling</h4>
              <p className="text-gray-600">Advanced AI generates realistic hair transformations in seconds. Over 200+ styles, colors, and cuts.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Session Management</h4>
              <p className="text-gray-600">Control session duration and AI usage limits. Perfect for busy salons with multiple clients.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Analytics Dashboard</h4>
              <p className="text-gray-600">Track popular styles, client engagement, and salon performance with detailed insights.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Secure & Private</h4>
              <p className="text-gray-600">Temporary sessions, no client data stored. GDPR compliant with enterprise-grade security.</p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <Scissors className="h-12 w-12 text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Instant Results</h4>
              <p className="text-gray-600">Lightning-fast AI processing with smart caching. Gemini-like instant experience for your clients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Salon Signs Up</h4>
              <p className="text-gray-600">Create account, choose subscription, get your permanent QR code instantly.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Client Scans QR</h4>
              <p className="text-gray-600">Clients scan your QR code, take a selfie, and start exploring hairstyles.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">AI Magic Happens</h4>
              <p className="text-gray-600">Advanced AI applies chosen styles instantly. Client sees results and makes confident decisions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Salon?
          </h3>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of salons already using Magic Mirror to delight clients and boost revenue.
          </p>
          <Link href="/salon/signup" className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scissors className="h-6 w-6" />
                <span className="text-xl font-bold">Magic Mirror</span>
              </div>
              <p className="text-gray-400">
                AI-powered virtual hair styling for modern salons.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/api-docs" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Magic Mirror. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
