from fastapi import APIRouter, HTTPException, Response, Depends, BackgroundTasks
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
from middleware.auth import get_current_user
from utils.db import get_db
from utils.api_logger import log_api_usage

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
    style: str = "Professional"  # Add style parameter

# --- Endpoints ---

@router.post("/rewrite-resume")
async def rewrite_resume_endpoint(req: RewriteResumeRequest, background_tasks: BackgroundTasks, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_data = await db.fetchrow("SELECT plan FROM users WHERE id = $1", current_user["id"])
    if user_data["plan"] != "pro":
        raise HTTPException(status_code=403, detail="Resume Rewriting is a Pro feature. Please upgrade.")

    try:
        result = rewrite_resume(req.resume_text, req.style)
        if not result or "rewritten_text" not in result:
            raise HTTPException(status_code=500, detail="Failed to rewrite resume or no rewritten_text found.")
        
        # Log usage
        tokens = result.pop("_tokens_used", 0)
        background_tasks.add_task(log_api_usage, current_user["id"], "/rewrite-resume", tokens)
        
        return result["rewritten_text"]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/generate-improved-pdf")
async def generate_improved_pdf_endpoint(req: ImprovedPDFRequest):
    try:
        pdf_bytes = generate_text_pdf(req.text, req.style)
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
async def generate_cover_letter_endpoint(req: CoverLetterRequest, background_tasks: BackgroundTasks, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_data = await db.fetchrow("SELECT plan FROM users WHERE id = $1", current_user["id"])
    if user_data["plan"] != "pro":
        raise HTTPException(status_code=403, detail="Cover Letter generation is a Pro feature. Please upgrade.")

    try:
        result = generate_cover_letter(req.resume_text, req.job_title, req.company_name)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate cover letter.")
        
        # Log usage
        tokens = result.pop("_tokens_used", 0)
        background_tasks.add_task(log_api_usage, current_user["id"], "/generate-cover-letter", tokens)
        
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/generate-linkedin")
async def generate_linkedin_endpoint(req: LinkedInRequest, background_tasks: BackgroundTasks, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_data = await db.fetchrow("SELECT plan FROM users WHERE id = $1", current_user["id"])
    
    # Check if free user has already used their 3 LinkedIn generations
    if user_data["plan"] == "free":
        usage_count = await db.fetchval("""
            SELECT COUNT(*) FROM api_usage_logs 
            WHERE user_id = $1 AND endpoint = '/generate-linkedin'
        """, current_user["id"])
        
        if usage_count >= 3:
            raise HTTPException(status_code=403, detail="Free LinkedIn generation limit reached (3/3). Please upgrade to Pro.")

    try:
        result = generate_linkedin_summary(req.resume_text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to generate LinkedIn summary.")
        
        # Log usage
        tokens = result.pop("_tokens_used", 0)
        background_tasks.add_task(log_api_usage, current_user["id"], "/generate-linkedin", tokens)
        
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/improve-section")
async def improve_section_endpoint(req: ImproveSectionRequest, background_tasks: BackgroundTasks, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_data = await db.fetchrow("SELECT plan FROM users WHERE id = $1", current_user["id"])
    if user_data["plan"] != "pro":
        raise HTTPException(status_code=403, detail="AI Section Improvement is a Pro feature. Please upgrade.")

    try:
        result = improve_resume_section(req.section_text, req.section_name)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to improve section.")
        
        # Log usage
        tokens = result.pop("_tokens_used", 0)
        background_tasks.add_task(log_api_usage, current_user["id"], "/improve-section", tokens)
        
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/evaluate-answer")
async def evaluate_answer_endpoint(req: EvaluateAnswerRequest, background_tasks: BackgroundTasks, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_data = await db.fetchrow("SELECT plan FROM users WHERE id = $1", current_user["id"])
    if user_data["plan"] != "pro":
        raise HTTPException(status_code=403, detail="Interview evaluation is a Pro feature. Please upgrade.")

    try:
        result = get_interview_feedback(req.question, req.user_answer, req.resume_text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to evaluate answer.")

        # Log usage
        tokens = result.pop("_tokens_used", 0)
        background_tasks.add_task(log_api_usage, current_user["id"], "/evaluate-answer", tokens)

        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.get("/usage/linkedin-count")
async def get_linkedin_usage_count(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get the LinkedIn generation usage count for the current user"""
    try:
        usage_count = await db.fetchval("""
            SELECT COUNT(*) FROM api_usage_logs
            WHERE user_id = $1 AND endpoint = '/generate-linkedin'
        """, current_user["id"])

        return {"count": usage_count or 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch usage count: {e}")
