from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from utils.pdf_parser import extract_text_from_pdf
from utils.groq_client import analyze_resume_with_ai
from models.analysis import AnalysisResponse

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    lang: str = Form('en')
):
    # 1. Validate File Type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # 2. Extract Text
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

    text = extract_text_from_pdf(content)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    # 3. AI Analysis
    analysis_result = analyze_resume_with_ai(text, job_description, lang)
    if not analysis_result:
        raise HTTPException(status_code=500, detail="AI Analysis failed.")

    # 4. Return combined result
    analysis_result["raw_text"] = text
    return analysis_result
