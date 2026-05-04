'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignIn, Envelope, Lock, Eye, EyeSlash } from '@phosphor-icons/react'
import { login } from '../../../lib/api'
import useAuthStore from '../../../stores/useAuthStore'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: setAuth } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle Google Callback
  useEffect(() => {
    const token = searchParams.get('token')
    const name = searchParams.get('name')
    const email = searchParams.get('email')

    if (token && name && email) {
      setAuth(token, { name, email, analysis_count: 0, plan: 'free', is_verified: true })
      router.push('/')
    }
  }, [searchParams, router, setAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      setAuth(res.access_token, {
        name: res.user_name,
        email: res.user_email,
        analysis_count: res.analysis_count || 0,
        plan: res.plan || 'free',
        is_verified: res.is_verified || false
      })
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 py-12">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-8 text-brand-primary">
            <div className="p-4 bg-brand-primary/10 rounded-full">
                <SignIn size={40} weight="duotone" />
            </div>
        </div>

        <h1 className="text-3xl font-heading font-bold text-white mb-2 text-center">Welcome Back</h1>
        <p className="text-text-muted text-center mb-8">Login to access your analysis results.</p>

        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-brand-primary hover:underline font-bold">
                    Forgot Password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg py-3 font-semibold transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Logging in...
                    </>
                ) : 'Login'}
            </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0f] px-2 text-gray-500 font-bold">Or continue with</span>
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

        <p className="text-text-muted text-center mt-8">
          Don't have an account?{' '}
          <Link href="/signup" className="text-brand-primary hover:underline font-medium">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
