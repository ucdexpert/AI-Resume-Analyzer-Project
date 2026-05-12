"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/stores/useAuthStore";
import { motion } from "framer-motion";
import { User, Envelope, Calendar, Shield, CreditCard, Clock, Warning, CheckCircle } from "@phosphor-icons/react";
import api from "@/lib/api";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfileData();
    }
  }, [isLoggedIn]);

  const fetchProfileData = async () => {
    try {
      // In a real app, we'd have a specific profile stats endpoint
      // For now, we'll just simulate or use analysis count from user
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mb-6">
          <Warning size={40} weight="fill" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Restricted</h1>
        <p className="text-text-muted mb-8">Please login to view your professional profile.</p>
        <button className="bg-brand-primary text-black font-bold px-8 py-3 rounded-xl">Login Now</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-10 md:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Left: User Card */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="glass-card p-4 sm:p-6 md:p-8 text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto mb-4 sm:mb-6 border-2 border-brand-primary/30">
                <User size={40} weight="fill" className="sm:hidden" />
                <User size={48} weight="fill" className="hidden sm:block" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 truncate px-2">{user?.name}</h2>
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 px-2">
                <p className="text-text-muted text-xs sm:text-sm truncate">{user?.email}</p>
                {user?.is_verified && (
                    <span title="Verified Account">
                      <CheckCircle size={14} className="text-brand-success flex-shrink-0 sm:w-4 sm:h-4" weight="fill" />
                    </span>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold">Account Plan</span>
                    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded font-bold uppercase ${
                      user?.plan?.toLowerCase() === 'pro'
                        ? 'bg-brand-primary/20 text-brand-primary'
                        : 'bg-white/10 text-text-muted'
                    }`}>
                      {user?.plan || 'Free'}
                    </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold">Member Since</span>
                    <span className="text-[10px] sm:text-xs text-white font-bold">May 2026</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-4 sm:p-6">
               <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                 <Shield size={18} className="text-brand-success sm:w-5 sm:h-5" />
                 Account Security
               </h3>
               <button className="w-full text-left p-2 sm:p-3 rounded-xl hover:bg-white/5 text-xs sm:text-sm transition-all border border-white/5">Change Password</button>
               <button className="w-full text-left p-2 sm:p-3 rounded-xl hover:bg-white/5 text-xs sm:text-sm transition-all border border-white/5 mt-2">Two-Factor Auth</button>
            </div>

            <div className="glass-card p-4 sm:p-6">
               <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                 <CreditCard size={18} className="text-brand-primary sm:w-5 sm:h-5" />
                 Billing & Subscriptions
               </h3>
               <Link href="/profile/billing" className="block w-full text-left p-2 sm:p-3 rounded-xl hover:bg-white/5 text-xs sm:text-sm transition-all border border-white/5 flex items-center justify-between">
                  <span>Billing History</span>
                  <Clock size={14} className="text-text-muted sm:w-4 sm:h-4" />
               </Link>
               <Link href="/pricing" className="block w-full text-left p-2 sm:p-3 rounded-xl hover:bg-white/5 text-xs sm:text-sm transition-all border border-white/5 mt-2 flex items-center justify-between">
                  <span>Upgrade Plan</span>
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
               </Link>
            </div>
          </div>

          {/* Right: Usage & History */}
          <div className="lg:col-span-2 space-y-8">
             <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <CreditCard size={28} className="text-brand-primary" />
                  Usage Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Analyses Used</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-white">{user?.analysis_count || 0}</span>
                        <span className="text-gray-600 mb-1">
                          {user?.plan?.toLowerCase() === 'pro' ? '/ Unlimited' : '/ 3 free'}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-brand-primary h-full" 
                          style={{ 
                            width: user?.plan?.toLowerCase() === 'pro' 
                              ? '100%' 
                              : `${Math.min(((user?.analysis_count || 0) / 3) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                   </div>

                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Resume Storage</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-white">1</span>
                        <span className="text-gray-600 mb-1">/ 5 slots</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-brand-info h-full w-1/5"></div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Clock size={28} className="text-purple-400" />
                  Recent Activity
                </h2>
                <div className="space-y-4">
                   <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <Calendar size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">Resume Analyzed</h4>
                        <p className="text-xs text-text-muted">Software_Engineer_Resume.pdf</p>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase">2 hours ago</span>
                   </div>
                   
                   <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 opacity-60">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                        <User size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold">Profile Created</h4>
                        <p className="text-xs text-text-muted">Welcome to SkillSense!</p>
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase">Today</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
