'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Users, MagnifyingGlass, Funnel, DotsThreeOutlineVertical, Prohibit, CheckCircle, Info, Trash, ArrowClockwise } from '@phosphor-icons/react'
import Link from 'next/link'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [plan, setPlan] = useState('')
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [page, plan])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminApi.get('/admin/users', {
        params: { page, search, plan, limit: 10 }
      })
      setUsers(res.data.users)
      setTotal(res.data.total)
    } catch (err) {
      console.error("Failed to fetch users", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const handleBan = async (userId: string) => {
    const reason = prompt("Enter ban reason:")
    if (!reason) return
    try {
      await adminApi.put(`/admin/users/${userId}/ban`, { reason })
      alert("User banned successfully")
      fetchUsers()
    } catch (err) {
      alert("Failed to ban user")
    } finally {
      setActionMenu(null)
    }
  }

  const handleUnban = async (userId: string) => {
    if (!confirm("Are you sure you want to unban this user?")) return
    try {
      await adminApi.put(`/admin/users/${userId}/unban`)
      alert("User unbanned successfully")
      fetchUsers()
    } catch (err) {
      alert("Failed to unban user")
    } finally {
      setActionMenu(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("CRITICAL: Delete this user permanently? This cannot be undone.")) return
    try {
      await adminApi.delete(`/admin/users/${userId}`)
      alert("User deleted permanently")
      fetchUsers()
    } catch (err) {
      alert("Failed to delete user. (Superadmin access required)")
    } finally {
      setActionMenu(null)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white font-heading">User Management</h1>
            <p className="text-gray-500">View and manage all registered users.</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl border border-brand-primary/20">
            <Users size={20} weight="bold" />
            <span className="font-bold">{total} Total Users</span>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <form onSubmit={handleSearch} className="md:col-span-2 relative">
            <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
                type="text" 
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-brand-primary focus:bg-white/10 transition-all"
            />
        </form>
        <div className="relative">
            <Funnel className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <select 
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none appearance-none focus:border-brand-primary transition-all"
            >
                <option value="" className="bg-[#0a0a0f]">All Plans</option>
                <option value="free" className="bg-[#0a0a0f]">Free</option>
                <option value="pro" className="bg-[#0a0a0f]">Pro</option>
                <option value="enterprise" className="bg-[#0a0a0f]">Enterprise</option>
            </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Usage</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={6} className="px-6 py-8">
                                    <div className="h-4 bg-white/5 rounded w-full"></div>
                                </td>
                            </tr>
                        ))
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-20 text-center text-gray-500">No users found matching your criteria.</td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                            {user.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{user.name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                        user.plan === 'pro' ? 'bg-amber-500/10 text-amber-500' :
                                        user.plan === 'enterprise' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-gray-500/10 text-gray-500'
                                    }`}>
                                        {user.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    <div className="flex flex-col">
                                        <span>{user.analyses_count} Analyses</span>
                                        <span className="text-[10px] text-gray-600">{user.monthly_analyses} this month</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_banned ? (
                                        <span className="flex items-center gap-1 text-red-500 text-xs font-bold">
                                            <Prohibit size={14} /> Banned
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold">
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 text-gray-500 hover:text-white transition-colors" title="View Details">
                                            <Info size={20} />
                                        </button>
                                        <div className="relative">
                                            <button 
                                                onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                                                className={`p-2 transition-colors rounded-lg ${actionMenu === user.id ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-brand-primary'}`}
                                            >
                                                <DotsThreeOutlineVertical size={20} weight="fill" />
                                            </button>
                                            
                                            {actionMenu === user.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-[#16161e] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    {user.is_banned ? (
                                                        <button 
                                                            onClick={() => handleUnban(user.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-green-400 hover:bg-green-400/10 transition-colors"
                                                        >
                                                            <ArrowClockwise size={18} /> Unban User
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleBan(user.id)}
                                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors"
                                                        >
                                                            <Prohibit size={18} /> Ban User
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(user.id)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors border-t border-white/5"
                                                    >
                                                        <Trash size={18} /> Delete Permanently
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing {users.length} of {total} users</span>
            <div className="flex gap-2">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                    Previous
                </button>
                <button 
                    disabled={page * 10 >= total}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                    Next
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}
