'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, CheckCircle, Warning, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'
import api from '@/lib/api'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
        setError('Invalid reset link. Token is missing.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 md:p-10 border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
              <Lock size={32} className="text-brand-primary" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Reset Password</h1>
            <p className="text-text-muted text-sm mt-2">Enter your new secure password below.</p>
          </div>

          {success ? (
            <div className="text-center py-6 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle size={40} className="text-green-500" weight="fill" />
               </div>
               <h3 className="text-white font-bold text-lg mb-2">Password Reset!</h3>
               <p className="text-text-muted text-sm mb-8">Your password has been updated successfully.</p>
               <Link 
                 href="/login"
                 className="w-full bg-brand-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
               >
                 Go to Login <ArrowRight weight="bold" />
               </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <Warning size={18} /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-primary transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input 
                  required
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-primary transition-all text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !!error}
                className="w-full bg-brand-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
