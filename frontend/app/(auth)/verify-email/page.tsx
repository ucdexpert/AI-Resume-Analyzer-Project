'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Warning, ArrowRight, EnvelopeOpen } from '@phosphor-icons/react'
import Link from 'next/link'
import api from '@/lib/api'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setStatus('error')
      setMessage('Verification token is missing.')
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const res = await api.get(`/auth/verify-email?token=${token}`)
      setStatus('success')
      setMessage(res.data.message)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.response?.data?.detail || 'Verification failed. The link may be invalid or expired.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-card p-10 border-white/10">
        <div>
          {status === 'loading' && (
            <div className="py-10">
                <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
            </div>
          )}

          {status === 'success' && (
            <div className="animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                  <CheckCircle size={48} className="text-green-500" weight="fill" />
               </div>
               <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
               <p className="text-text-muted mb-8">{message}</p>
               <Link href="/login" className="neon-button inline-flex items-center gap-2 w-full justify-center">
                  Continue to Login <ArrowRight weight="bold" />
               </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="animate-in shake duration-500">
               <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                  <Warning size={48} className="text-red-500" weight="fill" />
               </div>
               <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
               <p className="text-text-muted mb-8">{message}</p>
               <Link href="/signup" className="text-brand-primary font-bold hover:underline">
                  Try signing up again
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
