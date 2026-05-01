"use client";

import { motion } from "framer-motion";
import { Lifebuoy, MagnifyingGlass, Book, VideoCamera, ChatCircleText, Warning } from "@phosphor-icons/react";
import Link from "next/link";

const categories = [
  { title: "Getting Started", icon: Book, description: "Learn the basics of SkillSense analysis and builder." },
  { title: "Video Tutorials", icon: VideoCamera, description: "Watch step-by-step guides on optimizing your resume." },
  { title: "Account & Billing", icon: Warning, description: "Manage your subscription, plans, and payments." },
  { title: "AI Technology", icon: Lifebuoy, description: "Understand how our AI models analyze your skills." }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-brand-info/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Lifebuoy size={32} className="text-brand-info" weight="fill" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Help <span className="text-brand-info">Center</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Everything you need to know about SkillSense. Search our documentation or browse categories below.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-20 relative">
           <MagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
           <input 
             type="text"
             placeholder="Search for answers..."
             className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white outline-none focus:border-brand-info transition-all shadow-xl"
           />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
           {categories.map((cat, index) => {
             const Icon = cat.icon;
             return (
               <motion.div 
                 key={index}
                 initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="glass-card p-8 flex items-start gap-6 hover:bg-white/[0.03] transition-all group cursor-pointer"
               >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-brand-info/10 group-hover:text-brand-info transition-all shrink-0">
                    <Icon size={28} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
               </motion.div>
             );
           })}
        </div>

        <div className="mt-20 p-12 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
               <h2 className="text-2xl font-bold text-white mb-2">Can't find what you're looking for?</h2>
               <p className="text-text-muted">Our support team is available 24/7 to assist you.</p>
            </div>
            <div className="flex gap-4">
               <Link href="/contact" className="bg-brand-info text-black font-bold px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all">
                  Contact Us
               </Link>
               <button className="bg-white/10 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2">
                  <ChatCircleText size={20} />
                  Live Chat
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
