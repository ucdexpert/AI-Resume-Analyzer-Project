from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from utils.groq_client import (
    generate_cover_letter, 
    generate_linkedin_summary, 
    improve_resume_section, 
    get_interview_feedback,
    rewrite_resume
)
from utils.resume_generator import generate_resume_pdf
from utils.pdf_generator import generate_text_pdf

router = APIRouter()

# --- Models ---

class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    company_name: str

class LinkedInRequest(BaseModel):
    resume_text: str

class ImproveSectionRequest(BaseModel):
    section_text: str
    section_name: str

class EvaluateAnswerRequest(BaseModel):
    question: str
    user_answer: str
    resume_text: str

class RewriteResumeRequest(BaseModel):
    resume_text: str
    style: str

class ImprovedPDFRequest(BaseModel):
    text: str
    filename: str = "improved_resume.pdf"

# --- Endpoints ---

@router.post("/rewrite-resume")
async def rewrite_resume_endpoint(req: RewriteResumeRequest):
    try:
        result = rewrite_resume(req.resume_text, req.style)
        if not result or "rewritten_text" not in result:
            raise HTTPException(status_code=500, detail="Failed to rewrite resume or no rewritten_text found.")
        return result["rewritten_text"]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/generate-improved-pdf")
async def generate_improved_pdf_endpoint(req: ImprovedPDFRequest):
    try:
        pdf_bytes = generate_text_pdf(req.text)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={req.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-resume-pdf")
async def generate_pdf(data: dict):
    try:
        pdf_bytes = generate_resume_pdf(data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=resume.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-cover-letter")
async def generate_cover_letter_endpoint(req: CoverLetterRequest):
    try:
        result = generate_cover_letter(req.resume_text, req.job_title, req.company_name)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate cover letter.")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/generate-linkedin")
async def generate_linkedin_endpoint(req: LinkedInRequest):
    try:
        result = generate_linkedin_summary(req.resume_text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate LinkedIn summary.")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/improve-section")
async def improve_section_endpoint(req: ImproveSectionRequest):
    try:
        result = improve_resume_section(req.section_text, req.section_name)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to improve section.")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/evaluate-answer")
async def evaluate_answer_endpoint(req: EvaluateAnswerRequest):
    try:
        result = get_interview_feedback(req.question, req.user_answer, req.resume_text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to evaluate answer.")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
