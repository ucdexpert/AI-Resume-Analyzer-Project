'use client';

import React, { useEffect, useState } from 'react';
import { useAnalysisStore } from '@/stores/useAnalysisStore';
import useAuthStore from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreCard from '@/components/analysis/ScoreCard';
import StrengthsList from '@/components/analysis/StrengthsList';
import WeaknessList from '@/components/analysis/WeaknessList';
import SuggestionCard from '@/components/analysis/SuggestionCard';
import KeywordMatch from '@/components/analysis/KeywordMatch';
import ScoreTrend from '@/components/analysis/ScoreTrend';
import PersonalAnalytics from '@/components/analysis/PersonalAnalytics';
import AnalysisComparison from '@/components/analysis/AnalysisComparison';
import CoverLetterGenerator from '@/components/generators/CoverLetterGenerator';
import LinkedInGenerator from '@/components/generators/LinkedInGenerator';
import ImproveSectionModal from '@/components/generators/ImproveSectionModal';
import CareerInsights from '@/components/analysis/CareerInsights';
import InterviewQuestions from '@/components/analysis/InterviewQuestions';
import MockInterview from '@/components/generators/MockInterview';
import ResumeRewriter from '@/components/generators/ResumeRewriter';
import JobMatcher from '@/components/analysis/JobMatcher';
import { DashboardSkeleton } from '@/components/shared/Skeleton';
import { 
  ArrowLeft, Target, FileText, MagicWand, 
  MicrophoneStage, HandWaving, ChartLine, 
  ShareNetwork, Clock, WarningCircle, Crown, Printer
} from '@phosphor-icons/react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { translations } from '@/lib/translations';
import { getAnalysisHistory, generateAnalysisReport } from '@/lib/api';

import AuthGuard from '@/components/auth/AuthGuard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function WelcomeBanner({ 
  name, 
  score, 
  lastAnalyzed,
  analysisCount 
}: { 
  name: string, 
  score: number, 
  lastAnalyzed: string | null,
  analysisCount: number
}) {
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 86400)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const limitReached = analysisCount >= 3;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-12 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
            <HandWaving size={32} weight="duotone" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">Welcome back, {name}!</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mt-1">
              <span>Your resume is looking strong.</span>
              {lastAnalyzed && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                  <Clock size={14} />
                  <span>Last analyzed: {getTimeAgo(lastAnalyzed)}</span>
                </div>
              )}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${limitReached ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger' : 'bg-white/5 border-white/10'}`}>
                {limitReached ? <WarningCircle size={14} /> : <ChartLine size={14} />}
                <span>{analysisCount}/3 analyses used</span>
                {limitReached && <a href="/pricing" className="ml-1 underline font-bold">Upgrade</a>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="text-center">
            <div className="text-brand-primary font-bold text-2xl">{score}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Current Score</div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-2 text-brand-success">
            <Crown size={20} weight="duotone" />
            <span className="text-sm font-bold">Pro Features Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const { result } = useAnalysisStore();
  const { user, token } = useAuthStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const router = useRouter();
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!result) {
      router.push('/');
      return;
    }

    const fetchHistory = async () => {
      try {
        const data = await getAnalysisHistory();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [result, router]);

  const handleShare = async () => {
    setIsSharing(true);
    // Use the authentication token from store for sharing.
    const shareToken = token; 
    if (!shareToken) {
      alert('Authentication token not available for sharing.');
      setIsSharing(false);
      return;
    }
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Analysis link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy!', err);
    }
    setTimeout(() => setIsSharing(false), 2000);
  };

  const handleDownloadReport = async () => {
    if (!result) return;
    setReportLoading(true);
    try {
        const blob = await generateAnalysisReport(result);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Resume_Analysis_Report.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (err) {
        alert("Failed to download report");
    } finally {
        setReportLoading(false);
    }
  };

  if (loading) return <DashboardSkeleton />;
  if (!result) return null;

  const latestHistory = history.length > 0 ? history[0].created_at : null;

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl pt-20">
      <ImproveSectionModal 
        isOpen={isImproveModalOpen} 
        onClose={() => setIsImproveModalOpen(false)} 
      />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group"
        >
          <ArrowLeft size={20} className={`${lang !== 'en' ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
          {t.back}
        </button>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleDownloadReport}
            disabled={reportLoading}
            className="glass-card border-white/10 !bg-white/5 text-text-muted !py-2 !px-4 flex items-center gap-2 rounded-lg font-bold transition-all hover:bg-white/10"
          >
            {reportLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer size={20} weight="fill" />}
            Print Report
          </button>
          <button 
            onClick={handleShare}
            className="glass-card border-brand-primary/30 text-brand-primary !py-2 !px-4 flex items-center gap-2 rounded-lg font-bold transition-all hover:bg-brand-primary/10"
          >
            <ShareNetwork size={20} weight={isSharing ? "fill" : "bold"} />
            {isSharing ? 'Copied!' : 'Share Analysis'}
          </button>
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

      <WelcomeBanner 
        name={user?.name || 'User'} 
        score={result.overall_score} 
        lastAnalyzed={latestHistory}
        analysisCount={user?.analysis_count || 0}
      />

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
            {/* Score History Graph */}
            {history.length >= 1 && <ScoreTrend data={history} />}

            {/* Level 5: Personal Analytics */}
            <PersonalAnalytics history={history} />

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

            {/* Analysis Comparison */}
            {history.length >= 1 && <AnalysisComparison history={history} />}

            {/* Level 3.4: AI Job Matcher */}
            <JobMatcher resumeText={result.raw_text} />

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

            {/* Level 3.2: AI Resume Rewriter */}
            <ResumeRewriter resumeText={result.raw_text} />

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
                    key={typeof section.name === 'object' ? JSON.stringify(section.name) : section.name} 
                    className={`px-3 py-1 rounded-full text-sm border flex items-center gap-2 ${
                      section.exists 
                        ? 'bg-brand-success/10 text-brand-success border-brand-success/20' 
                        : 'bg-brand-danger/10 text-brand-danger border-brand-danger/20 opacity-50'
                    }`}
                  >
                    {section.exists ? '✅' : '❌'} {typeof section.name === 'object' ? JSON.stringify(section.name) : section.name}
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
