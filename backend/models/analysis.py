from pydantic import BaseModel
from typing import List, Dict, Optional

class ScoreBreakdown(BaseModel):
    formatting: int
    skills: int
    experience: int
    education: int
    summary: int

class SectionStatus(BaseModel):
    name: str
    exists: bool

class KeywordGroup(BaseModel):
    technical_skills: List[str]
    soft_skills: List[str]
    industry_terms: List[str]

class SalaryEstimate(BaseModel):
    range: str
    currency: str
    basis: str

class CareerPath(BaseModel):
    short_term: List[str]
    long_term: List[str]

class InterviewQuestion(BaseModel):
    question: str
    category: str
    suggested_answer: str

class AnalysisResponse(BaseModel):
    overall_score: int
    score_breakdown: ScoreBreakdown
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    ats_score: int
    ats_tips: List[str]
    missing_keywords: KeywordGroup
    section_checker: List[SectionStatus]
    industry_feedback: Optional[str] = None
    salary_estimate: Optional[SalaryEstimate] = None
    career_path: Optional[CareerPath] = None
    interview_questions: Optional[List[InterviewQuestion]] = None
    match_percentage: Optional[int] = None
    matched_keywords: Optional[List[str]] = None
    raw_text: str = ""
