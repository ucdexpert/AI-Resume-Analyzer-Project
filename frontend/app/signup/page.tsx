'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup } from '@/lib/api'
import useAuthStore from '@/stores/useAuthStore'
import Link from 'next/link'
import { UserPlus, Envelope, Lock, User, Eye, EyeSlash } from '@phosphor-icons/react'

export default function SignupPage() {
  const router = useRouter()
  const { login: setLogin } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
        setError("Passwords do not match")
        return
    }
    setLoading(true)
    setError('')
    try {
      const { confirmPassword, ...signupData } = form
      const res = await signup(signupData)
      setLogin(res.access_token, {
        name: res.user_name,
        email: res.user_email
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-12">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-8 text-brand-primary">
            <div className="p-4 bg-brand-primary/10 rounded-full">
                <UserPlus size={40} weight="duotone" />
            </div>
        </div>
        
        <h1 className="text-3xl font-heading font-bold text-white mb-2 text-center">Create Account</h1>
        <p className="text-text-muted text-center mb-8">Start your journey to a better career.</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <User size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 outline-none focus:border-brand-primary/50 transition-colors"
                />
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Envelope size={20} />
                </div>
                <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-10 pr-4 py-3 outline-none focus:border-brand-primary/50 transition-colors"
                />
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Lock size={20} />
                </div>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-10 pr-12 py-3 outline-none focus:border-brand-primary/50 transition-colors"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-white transition-colors"
                >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                    <Lock size={20} />
                </div>
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-10 pr-12 py-3 outline-none focus:border-brand-primary/50 transition-colors"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-white transition-colors"
                >
                    {showConfirmPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg py-3 font-semibold transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                    </>
                ) : 'Sign Up'}
            </button>
        </form>

        <p className="text-text-muted text-center mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-primary hover:underline font-medium">Login</Link>
        </p>
      </div>
    </div>
  )
}
