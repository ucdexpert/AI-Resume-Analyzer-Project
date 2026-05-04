'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { 
    CheckCircle, 
    XCircle, 
    Image as ImageIcon, 
    ArrowsCounterClockwise, 
    Clock, 
    User, 
    Bank,
    Eye
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminManualPayments() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('pending')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchManualPayments()
    }, [statusFilter])

    const fetchManualPayments = async () => {
        setLoading(true)
        try {
            const res = await adminApi.get('/admin/manual-payments', {
                params: { status: statusFilter }
            })
            setPayments(res.data)
        } catch (err) {
            console.error("Failed to fetch manual payments", err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        setProcessingId(id)
        try {
            await adminApi.put(`/admin/manual-payments/${id}`, {
                status: newStatus,
                admin_notes: newStatus === 'approved' ? 'Approved by admin' : 'Rejected by admin'
            })
            // Remove from list or update local state
            setPayments(payments.filter(p => p.id !== id))
        } catch (err) {
            alert("Failed to update status")
            console.error(err)
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-white/5 text-white border-white/10';
        }
    }

    return (
        <div className="animate-in fade-in duration-500">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-heading">Manual Payment Approvals</h1>
                    <p className="text-gray-500">Review JazzCash and Easypaisa transaction proofs.</p>
                </div>
                <button 
                    onClick={fetchManualPayments}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all"
                >
                    <ArrowsCounterClockwise size={20} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </header>

            {/* Filter */}
            <div className="mb-8">
                <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                    {['pending', 'approved', 'rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                statusFilter === s ? 'bg-brand-primary text-black' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {s}
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
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">User & Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Proof</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-12 bg-white/5 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        No {statusFilter} manual payments found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                                                    <User size={20} weight="duotone" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-medium truncate max-w-[200px]">{p.user_email}</span>
                                                    <span className="text-brand-primary text-[10px] font-bold uppercase tracking-wider">{p.plan} Plan</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white font-mono text-xs">
                                                    <span className="text-gray-500 uppercase text-[9px]">ID:</span> {p.transaction_id}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Bank size={14} className="text-gray-500" />
                                                    <span className="text-gray-400 text-xs">{p.payment_method}</span>
                                                    <span className="text-white text-xs font-bold">• PKR {p.amount}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedImage(p.screenshot_url)}
                                                className="group relative w-16 h-12 bg-black rounded-lg border border-white/10 overflow-hidden flex items-center justify-center hover:border-brand-primary transition-all"
                                            >
                                                <img 
                                                    src={`http://localhost:8000${p.screenshot_url}`} 
                                                    alt="Proof" 
                                                    className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40">
                                                    <Eye size={16} className="text-white" />
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        disabled={processingId === p.id}
                                                        onClick={() => handleUpdateStatus(p.id, 'approved')}
                                                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={20} weight="bold" />
                                                    </button>
                                                    <button 
                                                        disabled={processingId === p.id}
                                                        onClick={() => handleUpdateStatus(p.id, 'rejected')}
                                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={20} weight="bold" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-xs italic">
                                                    {new Date(p.created_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <div 
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden bg-[#0a0a0f] p-2 rounded-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={`http://localhost:8000${selectedImage}`} 
                                alt="Payment Proof Full" 
                                className="w-full h-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                            />
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors backdrop-blur-md"
                            >
                                <XCircle size={24} weight="fill" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
