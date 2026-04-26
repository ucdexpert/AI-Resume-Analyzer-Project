'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsLeftRight, Check, X, ChartLineUp } from '@phosphor-icons/react';
import ScoreCard from './ScoreCard';

interface AnalysisComparisonProps {
  history: any[];
}

export default function AnalysisComparison({ history }: AnalysisComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else if (selectedIds.length < 2) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getAnalysis = (id: string) => history.find(a => a.id === id);

  const analysis1 = selectedIds[0] ? getAnalysis(selectedIds[0]) : null;
  const analysis2 = selectedIds[1] ? getAnalysis(selectedIds[1]) : null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
            <ArrowsLeftRight size={28} weight="duotone" className="text-brand-primary" />
            Compare Analyses
          </h3>
          <p className="text-text-muted text-sm">Select two resumes to see your progress.</p>
        </div>
        {selectedIds.length === 2 && (
            <button 
                onClick={() => setIsComparing(!isComparing)}
                className="neon-button !py-2 !px-6"
            >
                {isComparing ? 'Close Comparison' : 'Compare Now'}
            </button>
        )}
      </div>

      {!isComparing ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.slice(0, 5).map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => toggleSelect(analysis.id)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedIds.includes(analysis.id)
                  ? 'bg-brand-primary/10 border-brand-primary'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {selectedIds.includes(analysis.id) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-black">
                  <Check weight="bold" size={14} />
                </div>
              )}
              <div className="text-xs text-text-muted mb-1">
                {new Date(analysis.created_at).toLocaleDateString()}
              </div>
              <div className="font-bold text-white truncate mb-2">{analysis.file_name}</div>
              <div className="text-brand-primary font-black text-xl">{analysis.overall_score}</div>
            </button>
          ))}
        </div>
      ) : (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8"
        >
            {[analysis1, analysis2].map((analysis, idx) => (
                <div key={idx} className="glass-card p-8 border-white/10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="text-xs text-text-muted mb-1">
                                {new Date(analysis.created_at).toLocaleDateString()}
                            </div>
                            <h4 className="text-xl font-heading font-bold text-white">{analysis.file_name}</h4>
                        </div>
                        <div className="text-4xl font-black text-brand-primary">{analysis.overall_score}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <ScoreCard score={analysis.ats_score} label="ATS Score" />
                        <ScoreCard score={analysis.score_breakdown?.skills || 0} label="Skills" />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h5 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Top Strengths</h5>
                            <ul className="space-y-2">
                                {analysis.strengths?.slice(0, 3).map((s: string) => (
                                    <li key={s} className="text-xs text-white flex gap-2">
                                        <span className="text-brand-success">•</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Key Improvements</h5>
                            <ul className="space-y-2">
                                {analysis.suggestions?.slice(0, 3).map((s: string) => (
                                    <li key={s} className="text-xs text-text-muted flex gap-2">
                                        <span className="text-brand-warning">•</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
        </motion.div>
      )}
    </div>
  );
}
