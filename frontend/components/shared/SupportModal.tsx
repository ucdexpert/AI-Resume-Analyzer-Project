'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatText, X, PaperPlaneTilt, CheckCircle, Warning, Clock, ArrowLeft } from '@phosphor-icons/react'
import api from '@/lib/api'

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [view, setView] = useState<'menu' | 'new' | 'history'>('menu')
  const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' })
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && view === 'history') {
      fetchMyTickets()
    }
  }, [isOpen, view])

  const fetchMyTickets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/support/my-tickets')
      setTickets(res.data)
    } catch (err) {
      console.error("Failed to fetch tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.message) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/support/tickets', form)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm({ subject: '', message: '', priority: 'normal' })
        setView('history')
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f0f17] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {view !== 'menu' && (
                    <button onClick={() => setView('menu')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                  <ChatText size={24} weight="duotone" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    {view === 'menu' ? 'Support Center' : view === 'new' ? 'New Ticket' : 'My Tickets'}
                  </h3>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {view === 'menu' && (
                <div className="grid grid-cols-1 gap-4 py-4">
                    <button 
                        onClick={() => setView('new')}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-brand-primary group transition-all"
                    >
                        <ChatText size={32} className="text-brand-primary group-hover:text-black mb-4" weight="fill" />
                        <h4 className="text-white group-hover:text-black font-bold text-lg">Create New Ticket</h4>
                        <p className="text-gray-500 group-hover:text-black/70 text-sm">Facing an issue? Let us know and we'll fix it.</p>
                    </button>

                    <button 
                        onClick={() => setView('history')}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 group transition-all"
                    >
                        <Clock size={32} className="text-purple-400 mb-4" weight="fill" />
                        <h4 className="text-white font-bold text-lg">Ticket History</h4>
                        <p className="text-gray-500 text-sm">View your previous tickets and admin responses.</p>
                    </button>
                </div>
              )}

              {view === 'new' && (
                success ? (
                    <div className="py-10 text-center">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                        <CheckCircle size={48} className="text-green-500" weight="fill" />
                      </div>
                      <h4 className="text-white font-bold text-xl mb-2">Submitted!</h4>
                      <p className="text-gray-500 text-sm">Redirecting to your history...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                            <Warning size={18} /> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                            <input 
                            type="text"
                            placeholder="Brief summary of the issue"
                            value={form.subject}
                            onChange={e => setForm({...form, subject: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-brand-primary transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Message</label>
                            <textarea 
                            placeholder="Explain your problem..."
                            value={form.message}
                            onChange={e => setForm({...form, message: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brand-primary transition-all text-sm h-32 resize-none"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <><PaperPlaneTilt size={20} weight="bold" /> Send Ticket</>}
                        </button>
                    </form>
                )
              )}

              {view === 'history' && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">You haven't created any tickets yet.</div>
                    ) : (
                        tickets.map(t => (
                            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            t.status === 'open' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                            {t.status}
                                        </span>
                                        <h4 className="text-white font-bold mt-2">{t.subject}</h4>
                                    </div>
                                    <span className="text-[10px] text-gray-600">{new Date(t.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-400 text-sm italic border-l-2 border-white/10 pl-3">"{t.message}"</p>
                                
                                {t.admin_reply && (
                                    <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl">
                                        <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <CheckCircle weight="fill" /> Admin Response
                                        </div>
                                        <p className="text-white text-sm leading-relaxed">{t.admin_reply}</p>
                                        <div className="text-[9px] text-gray-500 mt-2 text-right">Replied on {new Date(t.replied_at).toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
