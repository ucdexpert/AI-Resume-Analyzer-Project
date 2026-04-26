'use client';

import React, { useState, useEffect } from 'react';
import { getJobMatches } from '../../lib/api';
import { Briefcase, Target, ChartLineUp, BookOpen, ArrowRight, LinkedinLogo, MagnifyingGlass } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobMatcher({ resumeText }: { resumeText: string }) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeText) {
        handleGetMatches();
    }
  }, [resumeText]);

  const handleGetMatches = async () => {
    setLoading(true);
    try {
      const res = await getJobMatches(resumeText);
      setMatches(res.job_matches || []);
    } catch (err) {
      console.error('Failed to get job matches');
    } finally {
      setLoading(false);
    }
  };

  const getJobUrl = (title: string, platform: 'linkedin' | 'indeed') => {
    const query = encodeURIComponent(title);
    if (platform === 'linkedin') {
        return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
    }
    return `https://pk.indeed.com/jobs?q=${query}`;
  };

  if (loading) {
    return (
        <div className="glass-card p-12 flex flex-col items-center justify-center space-y-6 mb-12">
            <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
            <div className="text-center">
                <h3 className="text-xl font-heading font-bold text-white mb-2">Analyzing Job Market...</h3>
                <p className="text-text-muted text-sm max-w-xs">We're finding the best roles for your skill set in the current market.</p>
            </div>
        </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-success/20 flex items-center justify-center text-brand-success">
          <Target size={28} weight="duotone" />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-white">AI Job Matcher</h3>
          <p className="text-text-muted text-sm">Top 10 roles that match your profile and how to bridge the gap.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {matches.map((job, idx) => (
          <motion.div
            key={job.role_title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 border-white/5 hover:border-brand-primary/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-heading font-bold text-white group-hover:text-brand-primary transition-colors">{job.role_title}</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{job.why_match}</p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-2xl font-black text-brand-primary leading-none">{job.match_score}%</div>
                <div className="text-[8px] uppercase tracking-widest text-text-muted font-bold mt-1">Match</div>
              </div>
            </div>

            {/* Match Bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${job.match_score}%` }}
                    transition={{ delay: 0.5 + (idx * 0.1), duration: 1 }}
                    className="h-full bg-gradient-to-r from-brand-primary to-cyan-400"
                />
            </div>

            <div className="space-y-4">
                <div>
                    <h5 className="text-[10px] font-bold text-brand-success uppercase tracking-widest mb-2 flex items-center gap-1">
                        <BookOpen size={14} /> Skills to Acquire
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {job.key_gaps.map((gap: string) => (
                            <span key={gap} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-text-muted">
                                {gap}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
                <a 
                    href={getJobUrl(job.role_title, 'linkedin')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all flex items-center justify-center gap-2 group/btn"
                >
                    <LinkedinLogo size={16} weight="fill" />
                    LinkedIn
                </a>
                <a 
                    href={getJobUrl(job.role_title, 'indeed')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:bg-[#2164f3] hover:text-white hover:border-[#2164f3] transition-all flex items-center justify-center gap-2 group/btn"
                >
                    <MagnifyingGlass size={16} weight="bold" />
                    Indeed
                </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
