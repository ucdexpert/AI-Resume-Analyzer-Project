'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { signup, login } from '@/lib/api'
import useAuthStore from '@/stores/useAuthStore'
import Link from 'next/link'

export default function AuthModal({ 
  onSuccess, 
  onClose,
  defaultMode = 'signup'
}: { 
  onSuccess: () => void
  onClose: () => void
  defaultMode?: 'login' | 'signup'
}) {
  const [mode, setMode] = useState(defaultMode)
  const [form, setForm] = useState({ 
    name: '', email: '', password: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login: authLogin } = useAuthStore()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      let res
      if (mode === 'signup') {
        if (!form.name || !form.email || !form.password) {
            throw new Error("All fields are required");
        }
        res = await signup(form)
      } else {
        if (!form.email || !form.password) {
            throw new Error("Email and password are required");
        }
        res = await login({ 
          email: form.email, 
          password: form.password 
        })
      }
      authLogin(res.access_token, {
        name: res.user_name,
        email: res.user_email,
        analysis_count: res.analysis_count || 0
      })
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/google`);
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Failed to initialize Google Login");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111118] border border-white/10 rounded-2xl p-8 w-full max-w-md relative"
      >
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔐</div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'signup' 
              ? 'Create Account' 
              : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'signup'
              ? 'Sign up to analyze your resume with AI'
              : 'Login to continue with your analysis'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              mode === 'signup'
                ? 'bg-brand-primary text-black'
                : 'text-gray-400'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
              mode === 'login'
                ? 'bg-brand-primary text-black'
                : 'text-gray-400'
            }`}
          >
            Login
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({
                ...form, name: e.target.value
              })}
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-brand-primary transition placeholder:text-gray-500"
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({
              ...form, email: e.target.value
            })}
            className="w-full bg-white/10 text-white rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-brand-primary transition placeholder:text-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({
              ...form, password: e.target.value
            })}
            className="w-full bg-white/10 text-white rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-brand-primary transition placeholder:text-gray-500"
          />
          {mode === 'login' && (
            <div className="flex justify-end px-1">
              <Link 
                href="/forgot-password" 
                onClick={onClose}
                className="text-xs text-brand-primary hover:underline font-bold"
              >
                Forgot Password?
              </Link>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-brand-primary text-black font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading 
            ? 'Please wait...' 
            : mode === 'signup' 
              ? '🚀 Create Account & Analyze' 
              : '🔓 Login & Analyze'}
        </button>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#111118] px-2 text-gray-500 font-bold">Or continue with</span>
            </div>
        </div>

        <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
        >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.938 5.512 18 9 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.512 0 2.438 2.062.957 4.956L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Google
        </button>

        <p className="text-center text-gray-500 text-xs mt-6">
          Your resume is analyzed securely with AI 🔒
        </p>
      </motion.div>
    </div>
  )
}
