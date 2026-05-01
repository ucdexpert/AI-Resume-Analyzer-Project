'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from '@phosphor-icons/react'
import { adminApi } from '@/lib/adminApi'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem('admin-token')) {
      router.push('/admin/dashboard')
    }
  }, [router])

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const res = await adminApi.post('/admin/login', form)
      const data = res.data
      
      localStorage.setItem('admin-token', data.access_token)
      localStorage.setItem('admin-data', JSON.stringify({
        name: data.admin_name,
        role: data.admin_role
      }))
      router.push('/admin/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl shadow-brand-primary/5">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-primary/20">
            <Shield size={36} className="text-brand-primary" weight="fill" />
          </div>
          <h1 className="text-2xl font-bold text-white font-heading">Admin Panel</h1>
          <p className="text-gray-400 text-sm">SkillSense — Professional Access</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 
            text-red-400 p-3 rounded-lg mb-6 text-sm text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Email Address</label>
            <input
              type="email"
              placeholder="admin@skillsense.pk"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-white/5 text-white rounded-xl 
                px-4 py-3 outline-none border border-white/10 
                focus:border-brand-primary focus:bg-white/10 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full bg-white/5 text-white rounded-xl 
                px-4 py-3 outline-none border border-white/10 
                focus:border-brand-primary focus:bg-white/10 transition-all"
            />
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-brand-primary text-black font-bold 
                py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-brand-primary/20"
            >
              {loading ? 'Authenticating...' : '🔐 Secure Login'}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            Restricted Area. Authorized Personnel Only.
          </p>
        </div>
      </div>
    </div>
  )
}
