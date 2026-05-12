"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  HourglassSimple, 
  Receipt, 
  Info,
  ArrowLeft,
  MagnifyingGlass
} from "@phosphor-icons/react";
import { getManualPaymentHistory, BASE_URL } from "@/lib/api";
import Link from "next/link";

export default function BillingHistoryPage() {
  const { isLoggedIn } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(new Date(dateString));
  };

  const formatShortDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
    }
  }, [isLoggedIn]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getManualPaymentHistory();
      setHistory(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-brand-success bg-brand-success/10 border-brand-success/20';
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-text-muted bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle size={18} weight="fill" />;
      case 'rejected': return <XCircle size={18} weight="fill" />;
      case 'pending': return <HourglassSimple size={18} weight="fill" />;
      default: return <Info size={18} weight="fill" />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
        <p className="text-text-muted mb-8">Please login to view your billing history.</p>
        <Link href="/login" className="bg-brand-primary text-black font-bold px-8 py-3 rounded-xl">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt size={32} className="text-brand-primary" />
            Billing History
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-white/5 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center border-red-500/20 bg-red-500/5">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error Loading History</h3>
            <p className="text-text-muted mb-6">{error}</p>
            <button 
              onClick={fetchHistory}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CreditCard size={64} weight="thin" className="text-text-muted mx-auto mb-6" />
            <h3 className="text-xl font-bold mb-2">No Transactions Yet</h3>
            <p className="text-text-muted mb-8 max-w-sm mx-auto">
              Your manual payment history will appear here once you submit your first proof.
            </p>
            <Link 
              href="/pricing"
              className="neon-button inline-flex"
            >
              Upgrade Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id}
                className="glass-card overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                        <CreditCard size={24} weight="fill" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.plan} Plan</h3>
                        <p className="text-sm text-text-muted">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-1.5 rounded-full border text-sm font-bold flex items-center gap-2 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </div>
                      <div className="text-xl font-bold text-white">
                        PKR {item.amount}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Transaction ID</p>
                      <p className="text-sm font-mono text-white bg-white/5 px-2 py-1 rounded truncate">
                        {item.transaction_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Payment Method</p>
                      <p className="text-sm text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                        {item.payment_method}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Last Updated</p>
                      <p className="text-sm text-text-muted">
                        {formatShortDate(item.updated_at || item.created_at)}
                      </p>
                    </div>
                  </div>

                  {item.admin_notes && (
                    <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <p className="text-[10px] text-amber-500 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                        <Info size={12} weight="fill" />
                        Admin Feedback
                      </p>
                      <p className="text-sm text-amber-200/80 italic">
                        "{item.admin_notes}"
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <a 
                      href={`${BASE_URL}${item.screenshot_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-bold"
                    >                      <MagnifyingGlass size={14} />
                      View Payment Proof
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
