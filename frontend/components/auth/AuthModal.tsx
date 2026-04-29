'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { signup, login } from '@/lib/api'
import useAuthStore from '@/stores/useAuthStore'

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

        <p className="text-center text-gray-500 text-xs mt-4">
          Your resume is analyzed securely with AI 🔒
        </p>
      </motion.div>
    </div>
  )
}
