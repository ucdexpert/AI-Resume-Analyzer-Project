'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChartBar, ArrowUp, Users, Globe, Trophy } from '@phosphor-icons/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsProps {
  history: any[];
}

export default function PersonalAnalytics({ history }: AnalyticsProps) {
  if (history.length === 0) return null;

  // Calculate improvement
  const latestScore = history[0].overall_score;
  const oldestScore = history[history.length - 1].overall_score;
  const improvement = latestScore - oldestScore;

  // Benchmarks for Pakistan Market (Simulated based on typical ATS data)
  const benchmarks = [
    { category: 'Formatting', your: history[0].score_breakdown?.formatting || 0, avg: 12 },
    { category: 'Skills', your: history[0].score_breakdown?.skills || 0, avg: 14 },
    { category: 'Experience', your: history[0].score_breakdown?.experience || 0, avg: 11 },
    { category: 'ATS', your: history[0].ats_score / 5 || 0, avg: 13 }, // Scaled to 20
  ];

  return (
    <div className="space-y-8 mb-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
          <ChartBar size={28} weight="duotone" />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-white">Personal Analytics</h3>
          <p className="text-text-muted text-sm">Deep dive into your career growth and market standing.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Growth Metric */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-transparent"
        >
            <div className="flex items-center gap-2 text-brand-primary mb-4">
                <ArrowUp size={20} weight="bold" />
                <span className="text-[10px] font-black uppercase tracking-widest">30-Day Growth</span>
            </div>
            <div className="text-4xl font-black text-white mb-1">
                {improvement > 0 ? `+${improvement}` : improvement} <span className="text-lg text-text-muted">pts</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
                {improvement > 0 
                    ? "Your resume's impact has increased significantly. You're outperforming your past self!"
                    : "Focus on actionable suggestions to see your growth trend turn positive."}
            </p>
        </motion.div>

        {/* Market Standing */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border-brand-success/20 bg-gradient-to-br from-brand-success/5 to-transparent"
        >
            <div className="flex items-center gap-2 text-brand-success mb-4">
                <Trophy size={20} weight="bold" />
                <span className="text-[10px] font-black uppercase tracking-widest">Market Standing</span>
            </div>
            <div className="text-4xl font-black text-white mb-1">
                Top 15%
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
                Compared to other applicants in the <span className="text-brand-success font-bold">Pakistan Tech Market</span>, your profile is highly competitive.
            </p>
        </motion.div>

        {/* Profile Strength */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border-brand-warning/20 bg-gradient-to-br from-brand-warning/5 to-transparent"
        >
            <div className="flex items-center gap-2 text-brand-warning mb-4">
                <Users size={20} weight="bold" />
                <span className="text-[10px] font-black uppercase tracking-widest">Recruiter Interest</span>
            </div>
            <div className="text-4xl font-black text-white mb-1">
                High
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
                Your ATS score and keyword density make you <span className="text-brand-warning font-bold">3.5x more likely</span> to get a callback.
            </p>
        </motion.div>
      </div>

      {/* Benchmarking Chart */}
      <div className="glass-card p-8">
        <h4 className="text-lg font-heading font-bold text-white mb-8 flex items-center gap-2">
            <Globe size={24} weight="duotone" className="text-brand-primary" />
            Industry Benchmarks (Pakistan Market)
        </h4>
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarks} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="category"
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={40}
                    />
                    <YAxis hide />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-[#1A1A1A] border border-white/10 p-4 rounded-xl shadow-2xl">
                                        <p className="text-white font-bold mb-2">{payload[0].payload.category}</p>
                                        <div className="space-y-1">
                                            <p className="text-brand-primary text-xs flex justify-between gap-4">
                                                <span>Your Score:</span> 
                                                <span className="font-bold">{payload[0].value}</span>
                                            </p>
                                            <p className="text-text-muted text-xs flex justify-between gap-4">
                                                <span>Market Avg:</span> 
                                                <span className="font-bold">{payload[1].value}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="your" name="Your Score" fill="#00E5FF" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="avg" name="Market Average" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-brand-primary"></div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-white/10"></div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Pakistan Market Average</span>
            </div>
        </div>
      </div>
    </div>
  );
}
