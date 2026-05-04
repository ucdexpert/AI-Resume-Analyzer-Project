import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScoreBreakdown {
  formatting: number;
  skills: number;
  experience: number;
  education: number;
  summary: number;
}

interface SectionStatus {
  name: string;
  exists: boolean;
}

interface KeywordGroup {
  technical_skills: string[];
  soft_skills: string[];
  industry_terms: string[];
}

interface SalaryEstimate {
  range: string;
  currency: string;
  basis: string;
}

interface CareerPath {
  short_term: string[];
  long_term: string[];
}

interface InterviewQuestion {
  question: string;
  category: string;
  suggested_answer: string;
}

interface AnalysisResult {
  id?: string;
  overall_score: number;
  score_breakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  ats_score: number;
  ats_tips: string[];
  section_checker: SectionStatus[];
  missing_keywords: KeywordGroup;
  industry_feedback?: string;
  salary_estimate?: SalaryEstimate;
  career_path?: CareerPath;
  interview_questions?: InterviewQuestion[];
  match_percentage?: number;
  matched_keywords?: string[];
  raw_text: string;
}

interface AnalysisState {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  setResult: (result: AnalysisResult) => void;
  setAnalyzing: (status: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      result: null,
      isAnalyzing: false,
      error: null,
      setResult: (result) => set({ result, isAnalyzing: false, error: null }),
      setAnalyzing: (status) => set({ isAnalyzing: status, error: null }),
      setError: (error) => set({ error, isAnalyzing: false }),
      reset: () => set({ result: null, isAnalyzing: false, error: null }),
    }),
    {
      name: 'analysis-storage',
    }
  )
);
