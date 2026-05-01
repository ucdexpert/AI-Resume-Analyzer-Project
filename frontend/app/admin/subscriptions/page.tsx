'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { CreditCard, Receipt, Clock, CheckCircle, XCircle, ArrowsCounterClockwise } from '@phosphor-icons/react'

export default function AdminSubscriptions() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [page, status])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await adminApi.get('/admin/payments', {
        params: { page, status, limit: 10 }
      })
      setPayments(res.data.payments)
      setTotal(res.data.total)
    } catch (err) {
      console.error("Failed to fetch payments", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'refunded': return 'bg-gray-500/10 text-gray-400 border-white/10';
      default: return 'bg-white/5 text-white border-white/10';
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white font-heading">Subscription Payments</h1>
            <p className="text-gray-500">Track transactions and managed user subscriptions.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/20">
            <CreditCard size={20} weight="bold" />
            <span className="font-bold">Payment History</span>
        </div>
      </header>

      {/* Filter */}
      <div className="mb-8">
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
            {['', 'completed', 'pending', 'failed', 'refunded'].map((s) => (
                <button
                    key={s}
                    onClick={() => { setStatus(s); setPage(1); }}
                    className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        status === s ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'
                    }`}
                >
                    {s || 'All'}
                </button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Plan</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
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
                    ) : payments.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-20 text-center text-gray-500">No transactions recorded yet.</td>
                        </tr>
                    ) : (
                        payments.map((p) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Receipt size={18} className="text-gray-500" />
                                        <span className="text-white font-mono text-xs">{p.transaction_id || 'LOCAL_RECL'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-white text-sm font-medium">{p.user_name}</span>
                                        <span className="text-gray-500 text-[10px]">{p.user_email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.plan}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-bold">PKR {p.amount.toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-600">{p.payment_method}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(p.status)}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(p.created_at).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-500">Total {total} Transactions</span>
            <div className="flex gap-2">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                    Back
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
