'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, Check, Sparkle, Buildings, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const benefits = [
    "Unlimited Resume Analyses",
    "Premium ATS-Friendly Templates",
    "AI-Powered Resume Rewriting",
    "Priority Customer Support",
    "Advanced Career Insights"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop with enhanced blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] overflow-hidden flex flex-col max-h-[85vh] z-[1000]"
          >
            {/* Close Button - Internal but Fixed at top right */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-[1010] p-2 text-black bg-white hover:bg-gray-200 rounded-full transition-all shadow-xl hover:scale-110 active:scale-95 group"
              aria-label="Close modal"
            >
              <X size={20} weight="bold" className="transition-transform group-hover:rotate-90" />
            </button>

            <div className="overflow-y-auto scrollbar-thin">
                    {/* Top Decorative element */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50" />

                    {/* Header Section */}
                    <div className="px-8 pt-10 pb-6 text-center">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full animate-pulse-slow" />
                            <div className="relative w-20 h-20 bg-gradient-to-br from-brand-primary to-blue-600 rounded-3xl flex items-center justify-center border border-white/20 shadow-xl rotate-3">
                                <Crown size={40} className="text-white" weight="fill" />
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
                            Go <span className="text-brand-primary">Pro</span>
                        </h2>
                        <p className="text-text-muted text-base max-w-[280px] mx-auto leading-relaxed">
                            Elevate your career with our most powerful AI features.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <div className="px-8 py-4 space-y-3">
                        {benefits.map((item, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="flex items-center gap-3 text-sm text-gray-300 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05] hover:border-white/10 transition-colors"
                            >
                                <div className="flex-shrink-0 w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center">
                                    <Check size={14} className="text-brand-primary" weight="bold" />
                                </div>
                                <span className="font-medium">{item}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    <div className="p-8">
                        <div className="relative bg-gradient-to-br from-brand-primary/10 to-transparent p-1 rounded-3xl border border-white/10 overflow-hidden group">
                            {/* Subtle glow effect */}
                            <div className="absolute -inset-24 bg-brand-primary/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            <div className="relative bg-[#0f0f17] p-6 rounded-[calc(1.5rem-1px)]">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="inline-block px-3 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-wider rounded-lg border border-brand-primary/20 mb-3">
                                            Limited Time Offer
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black text-white">PKR 500</span>
                                            <span className="text-text-muted text-sm font-medium">/month</span>
                                        </div>
                                    </div>
                                    <div className="bg-brand-primary/10 p-2 rounded-xl">
                                        <Sparkle size={24} className="text-brand-primary" weight="fill" />
                                    </div>
                                </div>

                                <Link 
                                    href="/pricing" 
                                    onClick={onClose}
                                    className="w-full relative group/btn overflow-hidden bg-brand-primary hover:bg-brand-primary/90 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 active:scale-95"
                                >
                                    <span className="relative z-10 uppercase text-xs tracking-[0.2em]">Upgrade Now</span>
                                    <ArrowRight size={18} weight="bold" className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                </Link>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                <span className="flex items-center gap-2">
                                    <Check size={12} weight="bold" /> Secure Stripe Payment
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check size={12} weight="bold" /> Cancel Anytime
                                </span>
                            </div>
                            
                            <div className="h-px w-full bg-white/5" />
                            
                            <div className="flex items-center justify-between w-full px-2">
                                <div className="flex items-center gap-2 text-text-muted/60">
                                    <Buildings size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise?</span>
                                </div>
                                <Link 
                                    href="/contact" 
                                    onClick={onClose} 
                                    className="text-[10px] font-black text-brand-primary hover:text-brand-primary/80 transition-colors uppercase tracking-widest flex items-center gap-1"
                                >
                                    Get a quote <ArrowRight size={12} weight="bold" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                </motion.div>
                </div>

      )}
    </AnimatePresence>
  )
}

