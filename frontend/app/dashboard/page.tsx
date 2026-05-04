'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAnalysisStore } from '../../stores/useAnalysisStore';
import useAuthStore from '../../stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Critical components - load immediately
import ScoreCard from '../../components/analysis/ScoreCard';
import StrengthsList from '../../components/analysis/StrengthsList';
import WeaknessList from '../../components/analysis/WeaknessList';
import SuggestionCard from '../../components/analysis/SuggestionCard';
import { DashboardSkeleton } from '../../components/shared/Skeleton';

// Heavy components - lazy load
const KeywordMatch = dynamic(() => import('../../components/analysis/KeywordMatch'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

const ScoreTrend = dynamic(() => import('../../components/analysis/ScoreTrend'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

const PersonalAnalytics = dynamic(() => import('../../components/analysis/PersonalAnalytics'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

const AnalysisComparison = dynamic(() => import('../../components/analysis/AnalysisComparison'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

const CoverLetterGenerator = dynamic(() => import('../../components/generators/CoverLetterGenerator'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-96" />
});

const LinkedInGenerator = dynamic(() => import('../../components/generators/LinkedInGenerator'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

const ImproveSectionModal = dynamic(() => import('../../components/generators/ImproveSectionModal'));

const CareerInsights = dynamic(() => import('../../components/analysis/CareerInsights'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

const InterviewQuestions = dynamic(() => import('../../components/analysis/InterviewQuestions'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-96" />
});

const MockInterview = dynamic(() => import('../../components/generators/MockInterview'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-96" />
});

const ResumeRewriter = dynamic(() => import('../../components/generators/ResumeRewriter'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-96" />
});

const JobMatcher = dynamic(() => import('../../components/analysis/JobMatcher'), {
  loading: () => <div className="glass-card p-8 animate-pulse h-64" />
});

import {
  ArrowLeft, Target, FileText, MagicWand,
  MicrophoneStage, HandWaving, ChartLine,
  ShareNetwork, Clock, WarningCircle, Crown, Printer, X
} from '@phosphor-icons/react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../lib/translations';
import api, { getAnalysisHistory, generateAnalysisReport } from '../../lib/api';

import AuthGuard from '../../components/auth/AuthGuard';

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
  analysisCount,
  plan
}: { 
  name: string, 
  score: number, 
  lastAnalyzed: string | null,
  analysisCount: number,
  plan: string
}) {
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const limitReached = plan.toLowerCase() === 'free' && analysisCount >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 sm:p-6 md:p-8 mb-8 md:mb-12 bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div className="flex items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
            <HandWaving size={24} weight="duotone" className="md:hidden" />
            <HandWaving size={32} weight="duotone" className="hidden md:block" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold truncate">Welcome back, {name}!</h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm text-text-muted mt-1">
              <span className="hidden sm:inline">Your resume is looking strong.</span>
              {lastAnalyzed && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                  <Clock size={12} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">Last: {getTimeAgo(lastAnalyzed)}</span>
                </div>
              )}
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${limitReached ? 'bg-brand-danger/10 border-brand-danger/20 text-brand-danger' : 'bg-white/5 border-white/10'}`}>
                {limitReached ? <WarningCircle size={12} className="flex-shrink-0" /> : <ChartLine size={12} className="flex-shrink-0" />}
                <span className="whitespace-nowrap">
                  {plan.toLowerCase() === 'pro' ? 'Unlimited' : `${analysisCount}/3 used`}
                </span>
                {limitReached && <a href="/pricing" className="ml-1 underline font-bold whitespace-nowrap">Upgrade</a>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-2 sm:py-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 w-full md:w-auto justify-center">
          <div className="text-center">
            <div className="text-brand-primary font-bold text-2xl">{score}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Current Score</div>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          {plan.toLowerCase() === 'pro' ? (
            <div className="flex items-center gap-2 text-brand-success">
              <Crown size={20} weight="duotone" />
              <span className="text-sm font-bold">Pro Features Active</span>
            </div>
          ) : (
            <a href="/pricing" className="flex items-center gap-2 text-brand-warning hover:text-brand-warning/80 transition-colors">
              <Crown size={20} weight="duotone" />
              <span className="text-sm font-bold underline">Go Pro</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function DashboardContent() {
  const { result, reset } = useAnalysisStore();
  const { user, token, setUser } = useAuthStore();
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const router = useRouter();
  const [isImproveModalOpen, setIsImproveModalOpen] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set isMounted to true on client-side mount to avoid hydration mismatch with persist
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !result) {
      router.push('/');
      return;
    }

    if (isMounted && result) {
      const fetchData = async () => {
        try {
          const [historyData, userData] = await Promise.all([
            getAnalysisHistory(),
            api.get('/auth/me')
          ]);
          setHistory(historyData);
          if (userData.data) {
            setUser({
              name: userData.data.name,
              email: userData.data.email,
              analysis_count: userData.data.analysis_count,
              plan: userData.data.plan || 'free'
            });
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [result, router, setUser, isMounted]);

  const handleCloseAnalysis = () => {
    if (confirm("Are you sure you want to close this analysis? You can always find it in your profile history.")) {
      reset();
      router.push('/');
    }
  };

  const handleShare = async () => {
    if (!result?.id) {
      alert('Analysis ID not available. Please try refreshing.');
      return;
    }
    setIsSharing(true);
    try {
      const res = await api.post('/share', {
        analysis_id: result.id
      });
      const shareUrl = `${window.location.origin}/shared/${res.data.share_token}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Analysis link copied to clipboard!');
      } catch (err) {
        window.prompt('Copy this link:', shareUrl);
      }
    } catch (err) {
      console.error('Failed to share analysis:', err);
      alert('Failed to generate share link.');
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

  if (!isMounted || (loading && result)) return <DashboardSkeleton />;
  if (!result) return null;

  const latestHistory = history.length > 0 ? history[0].created_at : null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
      <ImproveSectionModal
        isOpen={isImproveModalOpen}
        onClose={() => setIsImproveModalOpen(false)}
      />

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group"
          >
            <ArrowLeft size={20} className={`${lang !== 'en' ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
            {t.back}
          </button>
          
          <div className="h-4 w-px bg-white/10 hidden md:block"></div>
          
          <button
            onClick={handleCloseAnalysis}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/5 border border-red-400/10"
          >
            <X size={14} weight="bold" />
            Close Analysis
          </button>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6 w-full md:w-auto">
          <button 
            onClick={handleDownloadReport}
            disabled={reportLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl border border-white/10 bg-white/5 text-text-muted font-bold transition-all hover:bg-white/10"
          >
            {reportLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Printer size={16} weight="fill" />}
            <span>Print</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl border border-brand-primary/30 bg-white/5 text-brand-primary font-bold transition-all hover:bg-brand-primary/10"
          >
            <ShareNetwork size={16} weight={isSharing ? "fill" : "bold"} />
            <span>{isSharing ? 'Copied!' : 'Share'}</span>
          </button>
          <button 
            onClick={() => setShowInterview(!showInterview)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl border font-bold transition-all ${showInterview ? 'bg-brand-primary text-white border-brand-primary' : 'border-brand-primary/30 text-brand-primary bg-white/5'}`}
          >
            <MicrophoneStage size={16} weight="fill" />
            <span>{showInterview ? 'Analysis' : 'Mock'}</span>
          </button>
          <button 
            onClick={() => router.push('/builder')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-xl border border-brand-warning/30 bg-white/5 text-brand-warning font-bold transition-all"
          >
            <FileText size={16} weight="fill" />
            <span>Builder</span>
          </button>
          <button 
            onClick={() => setIsImproveModalOpen(true)}
            className="col-span-2 sm:col-span-1 neon-button !py-2 !px-4 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
          >
            <MagicWand size={16} weight="fill" />
            <span>Improve</span>
          </button>
        </div>
      </div>

      <WelcomeBanner 
        name={user?.name || 'User'} 
        score={result.overall_score} 
        lastAnalyzed={latestHistory}
        analysisCount={user?.analysis_count || 0}
        plan={user?.plan || 'free'}
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
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
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
            {result.section_checker && result.section_checker.length > 0 && (
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
