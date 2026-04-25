'use client';

import React, { useEffect, useState } from 'react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreCard from '@/components/analysis/ScoreCard';
import StrengthsList from '@/components/analysis/StrengthsList';
import WeaknessList from '@/components/analysis/WeaknessList';
import SuggestionCard from '@/components/analysis/SuggestionCard';
import KeywordMatch from '@/components/analysis/KeywordMatch';
import CoverLetterGenerator from '@/components/generators/CoverLetterGenerator';
import LinkedInGenerator from '@/components/generators/LinkedInGenerator';
import ImproveSectionModal from '@/components/generators/ImproveSectionModal';
import CareerInsights from '@/components/analysis/CareerInsights';
import InterviewQuestions from '@/components/analysis/InterviewQuestions';
import MockInterview from '@/components/generators/MockInterview';
import { ArrowLeft, Target, FileText, MagicWand, MicrophoneStage } from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { translations } from '@/lib/translations';

import AuthGuard from '@/components/auth/AuthGuard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { result } = useAnalysisStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const router = useRouter();
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [showInterview, setShowInterview] = useState(false);

  useEffect(() => {
    if (!result) {
      router.push('/');
    }
  }, [result, router]);

  if (!result) return null;

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <ImproveSectionModal 
        isOpen={isImproveModalOpen} 
        onClose={() => setIsImproveModalOpen(false)} 
      />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={20} className={lang !== 'en' ? 'rotate-180' : ''} />
          {t.back}
        </button>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowInterview(!showInterview)}
            className={`!py-2 !px-4 flex items-center gap-2 rounded-lg font-bold transition-all border ${showInterview ? 'bg-brand-primary text-white border-brand-primary' : 'glass-card border-brand-primary/30 text-brand-primary'}`}
          >
            <MicrophoneStage size={20} weight="fill" />
            {showInterview ? t.viewAnalysis : t.mockInterview}
          </button>
          <button 
            onClick={() => router.push('/builder')}
            className="glass-card border-brand-warning/30 text-brand-warning !py-2 !px-4 flex items-center gap-2 rounded-lg font-bold transition-all"
          >
            <FileText size={20} weight="fill" />
            {t.builder}
          </button>
          <button 
            onClick={() => setIsImproveModalOpen(true)}
            className="neon-button !py-2 !px-4 flex items-center gap-2"
          >
            <MagicWand size={20} weight="fill" />
            {t.improveResume}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showInterview ? (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MockInterview 
              questions={result.interview_questions || []} 
              resumeText={result.raw_text} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Hero Score Section */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-1">
                <ScoreCard 
                  score={result.overall_score} 
                  label={t.overallScore} 
                  size="lg"
                  description={t.scoreDesc}
                />
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScoreCard score={result.score_breakdown.formatting} label="Formatting" />
                <ScoreCard score={result.score_breakdown.skills} label="Skills" />
                <ScoreCard score={result.score_breakdown.experience} label="Experience" />
                <ScoreCard score={result.score_breakdown.education} label="Education" />
                <ScoreCard score={result.score_breakdown.summary} label="Summary" />
                <ScoreCard score={result.ats_score} label={t.atsScore} />
              </div>
            </div>

            {/* Level 4: Career Insights */}
            <div className="mb-12">
              <CareerInsights 
                salary={result.salary_estimate}
                careerPath={result.career_path}
                industryFeedback={result.industry_feedback}
              />
            </div>

            {/* Main Analysis Content */}
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
                  {t.atsTips}
                </h3>
                <ul className="space-y-3">
                  {result.ats_tips.map((tip, i) => (
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

            {/* AI Generators (Level 3) */}
            <div className="grid gap-8 mb-12">
              <CoverLetterGenerator resumeText={result.raw_text} />
              <LinkedInGenerator resumeText={result.raw_text} />
            </div>

            {/* Section Status */}
            <div className="glass-card p-8 border-brand-success/20">
              <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3 text-brand-success">
                <FileText size={32} weight="duotone" />
                {t.sectionChecker}
              </h3>
              <p className="text-text-muted mb-6">
                {t.sectionDesc}
              </p>
              <div className="flex flex-wrap gap-3">
                {result.section_checker.map(section => (
                  <span 
                    key={section.name} 
                    className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${
                      section.exists 
                        ? 'bg-brand-success/10 text-brand-success border-brand-success/20' 
                        : 'bg-brand-danger/10 text-brand-danger border-brand-danger/20 opacity-50'
                    }`}
                  >
                    {section.exists ? '✅' : '❌'} {section.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
