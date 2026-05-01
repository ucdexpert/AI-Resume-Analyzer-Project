'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Warning, ArrowClockwise, House } from '@phosphor-icons/react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 blur-[120px] -z-10" />
      
      <div className="text-center max-w-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20 shadow-2xl shadow-red-500/5">
            <Warning size={48} weight="fill" className="text-red-500" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-heading font-bold text-white mb-4">Something Went Wrong</h1>
        <p className="text-text-muted text-lg mb-10 leading-relaxed">
          Our AI encountered an unexpected glitch. We've been notified and are working on fixing it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="bg-brand-primary text-black font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 w-full sm:w-auto"
          >
            <ArrowClockwise size={20} weight="bold" />
            Try Again
          </button>
          <Link href="/" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto flex items-center gap-2">
            <House size={20} />
            Back to Home
          </Link>
        </div>
        
        {error.digest && (
            <p className="mt-8 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                Error ID: {error.digest}
            </p>
        )}
      </div>
    </div>
  )
}
