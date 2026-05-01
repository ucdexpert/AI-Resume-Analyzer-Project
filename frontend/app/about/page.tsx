"use client";

import { motion } from "framer-motion";
import { Sparkle, ShieldCheck, Target, Users } from "@phosphor-icons/react";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            Empowering Your <span className="text-brand-primary">Career Journey</span>
          </h1>
          <p className="text-xl text-text-muted leading-relaxed">
            SkillSense is an AI-powered platform designed to bridge the gap between talented professionals and their dream jobs.
          </p>
        </motion.div>

        <div className="space-y-20">
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-text-muted leading-relaxed mb-4">
                In today's competitive job market, your resume needs to do more than just list your experience—it needs to tell a story that resonates with both AI filters and human recruiters.
              </p>
              <p className="text-text-muted leading-relaxed">
                Our mission is to provide every job seeker with the high-end analytical tools usually reserved for career coaches, making professional success accessible to everyone.
              </p>
            </div>
            <div className="glass-card p-8 bg-brand-primary/5 border-brand-primary/20">
              <Sparkle size={48} weight="duotone" className="text-brand-primary mb-6" />
              <h3 className="text-xl font-bold mb-2">AI-Driven Insights</h3>
              <p className="text-sm text-text-muted">
                Leveraging Llama 3.3 to provide deep, actionable feedback on your professional profile.
              </p>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-8">
             <div className="glass-card p-8 text-center">
               <ShieldCheck size={40} weight="duotone" className="text-brand-success mx-auto mb-4" />
               <h3 className="font-bold mb-2">Trust & Privacy</h3>
               <p className="text-sm text-text-muted">Your data is encrypted and never sold to third parties.</p>
             </div>
             <div className="glass-card p-8 text-center">
               <Target size={40} weight="duotone" className="text-brand-info mx-auto mb-4" />
               <h3 className="font-bold mb-2">ATS Focused</h3>
               <p className="text-sm text-text-muted">Optimized for modern Applicant Tracking Systems.</p>
             </div>
             <div className="glass-card p-8 text-center">
               <Users size={40} weight="duotone" className="text-brand-warning mx-auto mb-4" />
               <h3 className="font-bold mb-2">User Centric</h3>
               <p className="text-sm text-text-muted">Built with feedback from real recruiters and candidates.</p>
             </div>
          </section>

          <section className="text-center bg-white/5 rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">Meet the Developer</h2>
            <div className="flex flex-col items-center">
               <div className="w-32 h-32 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4 border-2 border-brand-primary/30 overflow-hidden shadow-xl shadow-brand-primary/10">
                 <img 
                    src="/my-picture.jpeg" 
                    alt="Muhammad Uzair" 
                    className="w-full h-full object-cover"
                 />
               </div>
               <h3 className="text-xl font-bold">Muhammad Uzair</h3>
               <p className="text-text-muted mb-6">Full Stack Developer & AI Enthusiast</p>
               <div className="flex gap-4">
                 <a href="https://github.com/ucdexpert" target="_blank" className="text-brand-primary hover:underline">GitHub</a>
                 <a href="https://www.linkedin.com/in/muhammad-uzair-066733314/" target="_blank" className="text-brand-primary hover:underline">LinkedIn</a>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
