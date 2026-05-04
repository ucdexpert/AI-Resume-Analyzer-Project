'use client'
import { useState } from 'react'
import { Envelope, ArrowLeft, CheckCircle, Warning } from '@phosphor-icons/react'
import Link from 'next/link'
import api from '@/lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <div className="glass-card p-8 md:p-10 border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
              <Envelope size={32} className="text-brand-primary" weight="duotone" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Forgot Password?</h1>
            <p className="text-text-muted text-sm mt-2">No worries, we'll send you reset instructions.</p>
          </div>

          {success ? (
            <div className="text-center py-6 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle size={40} className="text-green-500" weight="fill" />
               </div>
               <h3 className="text-white font-bold text-lg mb-2">Check your email</h3>
               <p className="text-text-muted text-sm">We've sent a password reset link to <br/> <span className="text-white font-medium">{email}</span></p>
               <button 
                 onClick={() => setSuccess(false)}
                 className="mt-8 text-brand-primary font-bold text-sm hover:underline"
               >
                 Didn't receive it? Try again
               </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                  <Warning size={18} /> {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-primary transition-all text-sm"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
