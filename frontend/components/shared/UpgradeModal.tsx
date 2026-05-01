'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, Check, Sparkle, Rocket, Buildings } from '@phosphor-icons/react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0a0a0f] border border-brand-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-500 hover:text-white z-10 p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <X size={24} />
            </button>

            <div className="grid md:grid-cols-2">
                {/* Left Side: Illustration & Hook */}
                <div className="p-12 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent hidden md:flex flex-col justify-between">
                    <div>
                        <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-8 border border-brand-primary/30">
                            <Crown size={32} className="text-brand-primary" weight="fill" />
                        </div>
                        <h2 className="text-4xl font-heading font-bold text-white mb-6 leading-tight">
                            Unlock Your <br />
                            <span className="text-brand-primary">Full Potential</span>
                        </h2>
                        <p className="text-text-muted leading-relaxed mb-8">
                            You've reached your free analysis limit. Upgrade to Pro and give your career the AI edge it deserves.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            "Unlimited AI Resume Analyses",
                            "Access to Llama 3.3 Flagship",
                            "Premium ATS-Friendly Templates",
                            "Priority Human Support"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                <Check size={18} className="text-brand-primary" weight="bold" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Plans */}
                <div className="p-8 md:p-12 bg-white/[0.02]">
                    <div className="mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary mb-2 block">Limited Time Offer</span>
                        <h3 className="text-2xl font-bold text-white">Choose Your Plan</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Pro Plan Card */}
                        <div className="p-6 rounded-2xl bg-brand-primary text-black border border-brand-primary shadow-xl shadow-brand-primary/20 relative group cursor-pointer transition-all hover:scale-[1.02]">
                            <div className="absolute top-0 right-0 p-4">
                                <Sparkle size={20} weight="fill" />
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <Crown size={24} weight="fill" />
                                <span className="font-black uppercase tracking-widest text-xs">Recommended</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-xs font-bold opacity-70 uppercase">PKR</span>
                                <span className="text-4xl font-black">500</span>
                                <span className="text-sm font-bold opacity-70">/mo</span>
                            </div>
                            <p className="text-xs font-bold opacity-80 mb-6 uppercase tracking-wider">SkillSense Pro Edition</p>
                            <Link href="/pricing" onClick={onClose} className="w-full bg-black text-white py-3 rounded-xl font-bold block text-center shadow-lg transition-transform active:scale-95">
                                Upgrade Now
                            </Link>
                        </div>

                        {/* Enterprise Plan Link */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Buildings size={24} className="text-gray-400" />
                                    <div>
                                        <p className="text-white font-bold text-sm">Enterprise Plan</p>
                                        <p className="text-text-muted text-[10px] uppercase tracking-widest">For Teams & HRs</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-brand-primary">Contact Us</span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-8 text-[10px] text-center text-gray-500 uppercase tracking-widest font-medium">
                        Secure Checkout • No Hidden Fees • Cancel Anytime
                    </p>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
