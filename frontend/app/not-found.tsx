'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { House, Warning, MagnifyingGlass } from '@phosphor-icons/react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 blur-[120px] -z-10" />
      
      <div className="text-center max-w-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 relative inline-block"
        >
          <div className="text-[12rem] font-black text-white/5 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MagnifyingGlass size={80} weight="duotone" className="text-brand-primary animate-pulse" />
          </div>
        </motion.div>

        <h1 className="text-4xl font-heading font-bold text-white mb-4">Lost in Space?</h1>
        <p className="text-text-muted text-lg mb-10 leading-relaxed">
          The page you are looking for doesn't exist or has been moved to another galaxy. Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="neon-button flex items-center gap-2 group w-full sm:w-auto">
            <House size={20} weight="bold" />
            Back to Home
          </Link>
          <Link href="/help" className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto">
            Visit Help Center
          </Link>
        </div>
      </div>
    </div>
  )
}
