'use client'

import { CheckCircle, X, Sparkles, CreditCard } from 'lucide-react'

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  imagesAdded: number
  newBalance: number
}

export default function PaymentSuccessModal({ 
  isOpen, 
  onClose, 
  imagesAdded, 
  newBalance 
}: PaymentSuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-white/20 p-8 max-w-md w-full relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl"></div>
        
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            <X size={20} />
          </button>

          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles size={24} className="text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Success message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-white/80 text-lg">
              Your images have been added to your account
            </p>
          </div>

          {/* Payment details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <CreditCard size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Images Added</h3>
                  <p className="text-white/60 text-sm">Successfully processed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-400">+{imagesAdded}</p>
                <p className="text-white/60 text-sm">images</p>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80">New Balance:</span>
                <span className="text-xl font-bold text-white">{newBalance} images</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105"
            >
              Continue to Dashboard
            </button>
            
            <p className="text-center text-white/60 text-sm">
              Ready to create amazing hair transformations! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

