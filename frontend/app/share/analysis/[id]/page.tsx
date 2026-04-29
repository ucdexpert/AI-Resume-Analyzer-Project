'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ScoreCard from '@/components/analysis/ScoreCard';
import StrengthsList from '@/components/analysis/StrengthsList';
import WeaknessList from '@/components/analysis/WeaknessList';
import SuggestionCard from '@/components/analysis/SuggestionCard';
import KeywordMatch from '@/components/analysis/KeywordMatch';
import CareerInsights from '@/components/analysis/CareerInsights';
import { Globe, FileText, Target } from '@phosphor-icons/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function SharedAnalysisPage() {
  const { id } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedAnalysis = async () => {
      try {
        const response = await axios.get(`${API_URL}/shared/${id}`);
        setResult(response.data);
      } catch (err) {
        console.error("Failed to fetch shared analysis", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSharedAnalysis();
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mb-4"></div>
            <p className="text-text-muted animate-pulse font-bold tracking-widest uppercase text-xs">Loading Analysis...</p>
        </div>
    );
  }

  if (!result) {
    return (
        <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-white mb-4">404</h1>
            <p className="text-text-muted">This analysis link is invalid or has expired.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                    <Globe size={22} weight="fill" className="text-black" />
                </div>
                <div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest block">Public Analysis View</span>
                    <h2 className="text-white font-bold">{result.file_name}</h2>
                </div>
            </div>
        </div>

        {/* Hero Score Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1">
            <ScoreCard 
                score={result.overall_score} 
                label="Overall Score" 
                size="lg"
            />
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <ScoreCard score={result.score_breakdown.formatting} label="Formatting" />
            <ScoreCard score={result.score_breakdown.skills} label="Skills" />
            <ScoreCard score={result.score_breakdown.experience} label="Experience" />
            <ScoreCard score={result.score_breakdown.education} label="Education" />
            <ScoreCard score={result.score_breakdown.summary} label="Summary" />
            <ScoreCard score={result.ats_score} label="ATS Score" />
            </div>
        </div>

        {/* Career Insights */}
        <div className="mb-12">
            <CareerInsights 
            salary={result.salary_estimate}
            careerPath={result.career_path}
            industryFeedback={result.industry_feedback}
            />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
            <StrengthsList items={result.strengths} />
            <WeaknessList items={result.weaknesses} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
            <SuggestionCard items={result.suggestions} />
            </div>
            <div className="glass-card p-6">
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2 text-brand-primary">
                <Target size={24} weight="duotone" />
                ATS Tips
            </h3>
            <ul className="space-y-3">
                {result.ats_tips.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-text-muted flex gap-2">
                    <span className="text-brand-primary font-bold">•</span>
                    {tip}
                </li>
                ))}
            </ul>
            </div>
        </div>

        <div className="mb-12">
            <KeywordMatch 
            missing={result.missing_keywords} 
            matched={result.matched_keywords} 
            />
        </div>

        <div className="mt-20 text-center">
            <p className="text-text-muted text-xs">Built with <span className="text-white font-bold tracking-tight">AI Resume Analyzer</span></p>
        </div>
      </div>
    </div>
  );
}
