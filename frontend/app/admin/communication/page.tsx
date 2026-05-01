'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { 
  Envelope, 
  Trash, 
  UserList, 
  ChatText, 
  Calendar,
  CheckCircle,
  XCircle,
  MagnifyingGlass
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminCommunication() {
  const [activeTab, setActiveTab] = useState<'newsletter' | 'inquiries'>('newsletter')
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchData()
  }, [activeTab, page])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'newsletter') {
        const res = await adminApi.get('/admin/newsletter', { params: { page } })
        setSubscribers(res.data.subscribers)
        setTotal(res.data.total)
      } else {
        const res = await adminApi.get('/admin/contact-inquiries', { params: { page } })
        setInquiries(res.data.inquiries)
        setTotal(res.data.total)
      }
    } catch (err) {
      console.error("Failed to fetch data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return
    try {
      await adminApi.delete(`/admin/newsletter/${id}`)
      setSubscribers(subscribers.filter(s => s.id !== id))
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">Communication Hub</h1>
        <p className="text-gray-500">Manage newsletter subscribers and public inquiries.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mb-8">
        <button 
          onClick={() => { setActiveTab('newsletter'); setPage(1); }}
          className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${
            activeTab === 'newsletter' ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'
          }`}
        >
          <UserList size={18} />
          Newsletter
        </button>
        <button 
          onClick={() => { setActiveTab('inquiries'); setPage(1); }}
          className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${
            activeTab === 'inquiries' ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'
          }`}
        >
          <ChatText size={18} />
          Inquiries
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {activeTab === 'newsletter' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Subscribed On</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={3} className="px-6 py-4"><div className="h-6 bg-white/5 rounded"></div></td>
                    </tr>
                  ))
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500 italic">No subscribers found.</td>
                  </tr>
                ) : subscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{sub.email}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(sub.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remove Subscriber"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 p-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
              ))
            ) : inquiries.length === 0 ? (
              <div className="text-center py-20 text-gray-500 italic">No inquiries found.</div>
            ) : inquiries.map(inq => (
              <motion.div 
                key={inq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                      {inq.name[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{inq.name}</h3>
                      <p className="text-gray-500 text-sm">{inq.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-xs mb-1">Received on</div>
                    <div className="text-white text-sm font-medium">
                      {new Date(inq.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">Subject: {inq.subject}</div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{inq.message}</p>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <a 
                    href={`mailto:${inq.email}?subject=Re: ${inq.subject}`}
                    className="px-6 py-2 bg-brand-primary text-black rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Reply via Email
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > subscribers.length && (
        <div className="mt-8 flex justify-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30"
          >
            Previous
          </button>
          <button 
            disabled={page * 50 >= total}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
