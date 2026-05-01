'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ChartBar, Users, CreditCard, 
  ChatText, Gear, House, SignOut,
  Shield, List, X, ChatCircleText
} from '@phosphor-icons/react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: House },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartBar },
  { href: '/admin/communication', label: 'Communication', icon: ChatCircleText },
  { href: '/admin/subscriptions', label: 'Payments', icon: CreditCard },
  { href: '/admin/support', label: 'Support', icon: ChatText },
  { href: '/admin/settings', label: 'Settings', icon: Gear },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('admin-token')
    const adminData = localStorage.getItem('admin-data')
    
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
    
    if (adminData) {
      setAdmin(JSON.parse(adminData))
    }
  }, [pathname, router])

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  if (!mounted) return null
  if (pathname === '/admin/login') return <>{children}</>

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-data')
    router.push('/admin/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-brand-primary" weight="fill" />
          <div>
            <p className="text-white font-bold">Admin Panel</p>
            <p className="text-gray-500 text-xs">SkillSense</p>
          </div>
        </div>
        <button className="lg:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
          <X size={24} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 
                rounded-xl transition-all ${
                active 
                  ? 'bg-brand-primary text-black font-bold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={20} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Admin info */}
      <div className="p-4 border-t border-white/10">
        {admin && (
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-white text-sm font-semibold truncate">{admin.name}</p>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{admin.role}</p>
            </div>
            <button onClick={handleLogout}
              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
              <SignOut size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/5 border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Shield size={24} className="text-brand-primary" weight="fill" />
          <span className="text-white font-bold text-sm">SkillSense Admin</span>
        </div>
        <button className="text-white p-2" onClick={() => setIsSidebarOpen(true)}>
          <List size={24} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white/5 border-r border-white/10 flex-col fixed h-full z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="relative w-80 max-w-[85%] bg-[#0a0a0f] border-r border-white/10 flex flex-col h-full animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
