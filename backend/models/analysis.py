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

import uuid

class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    resume_id: Optional[str] = None
    overall_score: int = 0
    score_breakdown: ScoreBreakdown = ScoreBreakdown(formatting=0, skills=0, experience=0, education=0, summary=0)
    strengths: List[str] = []
    weaknesses: List[str] = []
    suggestions: List[str] = []
    ats_score: int = 0
    ats_tips: List[str] = []
    missing_keywords: KeywordGroup = KeywordGroup(technical_skills=[], soft_skills=[], industry_terms=[])
    section_checker: Optional[List[SectionStatus]] = []
    industry_feedback: Optional[str] = None
    salary_estimate: Optional[SalaryEstimate] = None
    career_path: Optional[CareerPath] = None
    interview_questions: Optional[List[InterviewQuestion]] = None
    match_percentage: Optional[int] = 0
    matched_keywords: Optional[List[str]] = []
    raw_text: str = ""

    class Config:
        json_encoders = {
            uuid.UUID: str
        }
