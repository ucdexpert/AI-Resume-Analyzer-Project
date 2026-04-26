'use client'
import useAuthStore from '../../stores/useAuthStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { List, SignOut, User, Layout, FileText, House } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!mounted) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/10 px-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform">
            <FileText size={24} weight="fill" className="text-white" />
          </div>
          <span className="text-xl font-heading font-bold text-white tracking-tight">AI Resume <span className="text-brand-primary">Analyzer</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="text-text-muted hover:text-white transition-colors flex items-center gap-2">
                  <Layout size={20} />
                  Dashboard
                </Link>
                <Link href="/builder" className="text-text-muted hover:text-white transition-colors flex items-center gap-2">
                  <FileText size={20} />
                  Builder
                </Link>
                <Link href="/pricing" className="text-text-muted hover:text-white transition-colors flex items-center gap-2">
                  Pricing
                </Link>
              </div>
              <div className="h-6 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-4">
                <LanguageToggle />
                <ThemeToggle />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center">
                    <User size={14} className="text-brand-primary" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-muted hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <SignOut size={22} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-text-muted hover:text-white transition-colors px-4">
                Pricing
              </Link>
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/login" className="text-text-muted hover:text-white transition-colors px-4 py-2">
                Login
              </Link>
              <Link href="/signup" className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
            <button className="text-white" onClick={() => setIsOpen(!isOpen)}>
                <List size={28} />
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f] border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
           {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-lg text-text-primary flex items-center gap-3">
                <Layout size={24} /> Dashboard
              </Link>
              <Link href="/builder" onClick={() => setIsOpen(false)} className="text-lg text-text-primary flex items-center gap-3">
                <FileText size={24} /> Builder
              </Link>
              <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-lg text-text-primary flex items-center gap-3">
                Pricing
              </Link>
              <button onClick={handleLogout} className="text-lg text-brand-danger flex items-center gap-3 border-t border-white/5 pt-4">
                <SignOut size={24} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/pricing" onClick={() => setIsOpen(false)} className="text-lg text-text-primary">Pricing</Link>
              <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg text-text-primary">Login</Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="bg-brand-primary text-white px-6 py-3 rounded-xl font-semibold text-center text-lg">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
