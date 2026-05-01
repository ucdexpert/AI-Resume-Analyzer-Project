'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkle, Crown, Buildings, Rocket, Clock } from '@phosphor-icons/react';
import Navbar from '../../components/shared/Navbar';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    desc: 'Perfect for getting started.',
    icon: <Rocket size={32} weight="duotone" className="text-text-muted" />,
    features: [
      '3 AI Analyses per month',
      'Basic ATS Score',
      '1 Resume Template',
      'Standard PDF Export',
      'Email Support'
    ],
    button: 'Current Plan',
    highlight: false
  },
  {
    name: 'Pro',
    price: '500',
    period: '/month',
    desc: 'Best for active job seekers.',
    icon: <Crown size={32} weight="duotone" className="text-brand-warning" />,
    features: [
      'Unlimited AI Analyses',
      'Flagship Llama 3.3 Access',
      '10+ Professional Templates',
      'AI Resume Rewriter (All Styles)',
      'Job Matcher & Gap Analysis',
      'Priority Support'
    ],
    button: 'Upgrade to Pro',
    highlight: true
  },
  {
    name: 'Enterprise',
    price: '2000',
    period: '/month',
    desc: 'For teams and recruiters.',
    icon: <Buildings size={32} weight="duotone" className="text-brand-primary" />,
    features: [
      'Team Access (up to 5 users)',
      'Bulk Resume Analysis',
      'Custom Branding',
      'API Access',
      'Dedicated Account Manager',
      'Advanced Analytics'
    ],
    button: 'Contact Sales',
    highlight: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />
      
      <div className="container mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">Simple, Transparent <span className="text-brand-primary">Pricing</span></h1>
            <p className="text-xl text-text-muted">Choose the plan that fits your career goals. No hidden fees.</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-card p-10 flex flex-col relative overflow-hidden ${
                plan.highlight ? 'border-brand-primary/50 shadow-[0_0_40px_rgba(0,229,255,0.1)]' : 'border-white/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0">
                    <div className="bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest px-8 py-1 rotate-45 translate-x-6 translate-y-2">
                        Most Popular
                    </div>
                </div>
              )}

              <div className="mb-8">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-text-muted">{plan.desc}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-text-muted">PKR</span>
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-text-muted">{plan.period}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="mt-1 bg-brand-primary/20 rounded-full p-0.5">
                        <Check size={12} className="text-brand-primary" weight="bold" />
                    </div>
                    <span className="text-sm text-text-muted">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                    plan.highlight 
                    ? 'bg-brand-primary text-black hover:bg-white shadow-[0_0_20px_rgba(0,229,255,0.3)]' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                {plan.button}
              </button>
              
              {plan.name !== 'Free' && (
                <div className="mt-6 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em] relative z-10 flex items-center justify-center gap-2">
                        <Clock size={14} weight="fill" className="animate-pulse" />
                        Payments Coming Soon
                    </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Preview or Trust Section */}
        <div className="mt-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <Sparkle size={16} className="text-brand-warning" weight="fill" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Trusted by 10,000+ Job Seekers</span>
            </div>
            <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
                {/* Simulated Partner Logos */}
                <div className="text-2xl font-black italic">LINKEDIN</div>
                <div className="text-2xl font-black italic">INDEED</div>
                <div className="text-2xl font-black italic">GLASSdoor</div>
                <div className="text-2xl font-black italic">Google</div>
            </div>
        </div>
      </div>
    </div>
  );
}
