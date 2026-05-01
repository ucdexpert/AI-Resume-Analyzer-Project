'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { ChatText, PaperPlaneTilt, Clock, CheckCircle, Warning, User, IdentificationCard } from '@phosphor-icons/react'

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTickets()
  }, [status])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await adminApi.get('/admin/support/tickets', {
        params: { status }
      })
      setTickets(res.data.tickets)
    } catch (err) {
      console.error("Failed to fetch tickets", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyText || !selectedTicket) return
    setSaving(true)
    try {
      await adminApi.put(`/admin/support/tickets/${selectedTicket.id}/reply`, {
        reply: replyText,
        status: 'resolved'
      })
      setReplyText('')
      setSelectedTicket(null)
      fetchTickets()
    } catch (err) {
      console.error("Reply failed", err)
    } finally {
      setSaving(false)
    }
  }

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
        case 'high': case 'urgent': return 'text-red-400 bg-red-400/10';
        case 'normal': return 'text-blue-400 bg-blue-400/10';
        default: return 'text-gray-400 bg-white/5';
    }
  }

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-heading">Support Center</h1>
        <p className="text-gray-500">Respond to user queries and resolve issues.</p>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Ticket List */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                {['', 'open', 'resolved'].map(s => (
                    <button 
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                            status === s ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? (
                [...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
                ))
            ) : tickets.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No tickets found.</div>
            ) : (
                tickets.map(ticket => (
                    <button 
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-5 rounded-2xl border text-left transition-all ${
                            selectedTicket?.id === ticket.id 
                            ? 'bg-brand-primary/10 border-brand-primary' 
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                                {ticket.priority}
                            </span>
                            <span className="text-[10px] text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-white font-bold mb-1 truncate">{ticket.subject}</h4>
                        <p className="text-gray-500 text-xs line-clamp-2">{ticket.message}</p>
                    </button>
                ))
            )}
        </div>

        {/* Conversation View */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex flex-col overflow-hidden">
            {selectedTicket ? (
                <>
                    <div className="p-6 border-b border-white/10 bg-white/[0.02]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{selectedTicket.user_name}</h3>
                                    <p className="text-gray-500 text-xs">{selectedTicket.user_email}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                selectedTicket.status === 'open' ? 'text-amber-500 border-amber-500/20' : 'text-green-500 border-green-500/20'
                            }`}>
                                {selectedTicket.status}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                        {/* User Message */}
                        <div className="flex flex-col items-start max-w-[80%]">
                            <div className="text-[10px] text-gray-500 mb-1 ml-2">User Request</div>
                            <div className="bg-white/10 border border-white/10 p-4 rounded-2xl rounded-tl-none text-white text-sm">
                                <div className="font-bold text-brand-primary mb-2">Subject: {selectedTicket.subject}</div>
                                {selectedTicket.message}
                            </div>
                        </div>

                        {/* Admin Reply */}
                        {selectedTicket.admin_reply && (
                             <div className="flex flex-col items-end max-w-[80%] ml-auto">
                                <div className="text-[10px] text-brand-primary mb-1 mr-2">Admin Response</div>
                                <div className="bg-brand-primary text-black p-4 rounded-2xl rounded-tr-none text-sm font-medium">
                                    {selectedTicket.admin_reply}
                                </div>
                             </div>
                        )}
                    </div>

                    {selectedTicket.status === 'open' && (
                        <div className="p-6 bg-white/[0.02] border-t border-white/10">
                            <div className="relative">
                                <textarea 
                                    placeholder="Write your response here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-16 text-white text-sm outline-none focus:border-brand-primary transition-all resize-none h-24"
                                />
                                <button 
                                    onClick={handleReply}
                                    disabled={saving || !replyText}
                                    className="absolute right-4 bottom-4 w-10 h-10 bg-brand-primary text-black rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <PaperPlaneTilt size={20} weight="fill" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                    <ChatText size={64} weight="thin" className="mb-4 opacity-20" />
                    <p>Select a ticket to view conversation.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
