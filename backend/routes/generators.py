from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from utils.groq_client import generate_cover_letter, generate_linkedin_summary, improve_resume_section, get_interview_feedback
from utils.resume_generator import generate_resume_pdf

router = APIRouter()

# --- Models ---

class ExperienceItem(BaseModel):
    title: str
    company: str
    dates: str
    description: str

class EducationItem(BaseModel):
    degree: str
    school: str
    dates: str

class ResumePDFRequest(BaseModel):
    name: str
    email: str
    phone: str
    location: str
    linkedin: str = ""
    portfolio: str = ""
    summary: str
    experience: List[ExperienceItem]
    education: List[EducationItem]
    skills: List[str]

class EvaluateAnswerRequest(BaseModel):
    question: str
    user_answer: str
    resume_text: str

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    company_name: str

class LinkedInRequest(BaseModel):
    resume_text: str

class ImproveSectionRequest(BaseModel):
    section_text: str
    section_name: str

# --- Endpoints ---

@router.post("/generate-resume-pdf")
async def resume_pdf_endpoint(req: ResumePDFRequest):
    try:
        pdf_bytes = generate_resume_pdf(req.dict())
        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={req.name.replace(' ', '_')}_Resume.pdf"}
        )
    except Exception as e:
        print(f"PDF Generation Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.post("/evaluate-answer")
async def evaluate_answer_endpoint(req: EvaluateAnswerRequest):
    result = get_interview_feedback(req.question, req.user_answer, req.resume_text)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to evaluate answer.")
    return result

@router.post("/generate-cover-letter")
async def cover_letter_endpoint(req: CoverLetterRequest):
    result = generate_cover_letter(req.resume_text, req.job_title, req.company_name)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate cover letter.")
    return result

@router.post("/generate-linkedin")
async def linkedin_endpoint(req: LinkedInRequest):
    result = generate_linkedin_summary(req.resume_text)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate LinkedIn summary.")
    return result

@router.post("/improve-section")
async def improve_section_endpoint(req: ImproveSectionRequest):
    result = improve_resume_section(req.section_text, req.section_name)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to improve section.")
    return result
