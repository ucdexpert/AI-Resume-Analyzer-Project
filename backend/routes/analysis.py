from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends, BackgroundTasks, Request, Response
from pydantic import BaseModel
from typing import Optional, List
import json
from utils.pdf_parser import extract_text_from_pdf
from utils.groq_client import analyze_resume_with_ai, match_resume_to_jd, match_resume_to_jobs
from models.analysis import AnalysisResponse
from middleware.auth import get_current_user
from utils.db import get_db
from utils.notifications import send_analysis_email
from utils.pdf_generator import generate_analysis_report_pdf
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

class MatchJobRequest(BaseModel):
    resume_text: str
    job_description: str

class JobMatchesRequest(BaseModel):
    resume_text: str

class ReportRequest(BaseModel):
    analysis_data: dict

@router.post("/match-job")
@limiter.limit("10/minute")
async def match_job_endpoint(request: Request, req: MatchJobRequest):
    try:
        result = match_resume_to_jd(req.resume_text, req.job_description)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to match job.")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/job-matches")
@limiter.limit("10/minute")
async def job_matches_endpoint(request: Request, req: JobMatchesRequest):
    try:
        result = match_resume_to_jobs(req.resume_text)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to find job matches.")
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@router.post("/generate-report")
async def generate_report_endpoint(req: ReportRequest):
    try:
        pdf_bytes = generate_analysis_report_pdf(req.analysis_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Analysis_Report.pdf"}
        )
    except Exception as e:
        print(f"Report Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=AnalysisResponse)
@limiter.limit("5/minute")
async def analyze_resume(
    request: Request,
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    lang: str = Form('en'),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    # 1. Validate File Type
    if not file.filename.lower().endswith('.pdf') or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Strictly PDF files are allowed.")

    # 3. Extract Text
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

    text = extract_text_from_pdf(content)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    # 4. AI Analysis
    try:
        analysis_result = analyze_resume_with_ai(text, job_description, lang)
        if not analysis_result:
            raise HTTPException(status_code=500, detail="AI Analysis failed.")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Internal Server Error: {e}")

    # Check for existing analysis of the same resume in the last 5 minutes
    existing_analysis_record = await db.fetchrow("""
        SELECT a.id, a.user_id, a.resume_id, a.overall_score, a.score_breakdown, a.ats_score, a.ats_tips, a.strengths, a.weaknesses, a.suggestions, a.missing_keywords, a.industry_feedback, a.salary_estimate, a.career_path, a.interview_questions, a.created_at, r.file_name, r.raw_text, r.uploaded_at
        FROM analysis a
        JOIN resumes r ON a.resume_id = r.id
        WHERE a.user_id = $1 
        AND r.raw_text = $2
        AND a.created_at > NOW() - INTERVAL '5 minutes'
        ORDER BY a.created_at DESC LIMIT 1
    """, current_user["id"], text)

    if existing_analysis_record:
        # Convert record to dict for processing
        res = dict(existing_analysis_record)
        json_fields = [
            'score_breakdown', 'ats_tips', 'strengths', 'weaknesses', 
            'suggestions', 'missing_keywords', 'salary_estimate', 
            'career_path', 'interview_questions'
        ]
        for field in json_fields:
            if res.get(field):
                try:
                    res[field] = json.loads(res[field])
                except:
                    pass
        res['raw_text'] = text # Ensure raw_text is always present
        return AnalysisResponse(**res)

    # 5. Save to Database & Increment Usage
    try:
        resume_id = await db.fetchrow(
            """
            INSERT INTO resumes (user_id, file_name, raw_text)
            VALUES ($1, $2, $3)
            RETURNING id
            """,
            current_user["id"], file.filename, text
        )

        await db.execute(
            """
            INSERT INTO analysis (
                user_id, resume_id, overall_score, score_breakdown, ats_score, ats_tips,
                strengths, weaknesses, suggestions, missing_keywords,
                industry_feedback, salary_estimate, career_path, interview_questions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """,
            current_user["id"],
            resume_id["id"],
            analysis_result.get("overall_score"),
            json.dumps(analysis_result.get("score_breakdown")),
            analysis_result.get("ats_score"),
            json.dumps(analysis_result.get("ats_tips")),
            json.dumps(analysis_result.get("strengths")),
            json.dumps(analysis_result.get("weaknesses")),
            json.dumps(analysis_result.get("suggestions")),
            json.dumps(analysis_result.get("missing_keywords")),
            analysis_result.get("industry_feedback"),
            json.dumps(analysis_result.get("salary_estimate")),
            json.dumps(analysis_result.get("career_path")),
            json.dumps(analysis_result.get("interview_questions"))
        )
        


        background_tasks.add_task(
            send_analysis_email, 
            current_user["email"], 
            current_user["name"], 
            analysis_result.get("overall_score")
        )
    except Exception as e:
        print(f"Error saving analysis to DB: {e}")

    analysis_result["raw_text"] = text
    return analysis_result

@router.get("/history")
async def get_analysis_history(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        query = """
            SELECT a.id, a.user_id, a.resume_id, a.overall_score, a.score_breakdown, a.ats_score, a.ats_tips, a.strengths, a.weaknesses, a.suggestions, a.missing_keywords, a.industry_feedback, a.salary_estimate, a.career_path, a.interview_questions, a.created_at, r.file_name, r.uploaded_at
            FROM analysis a
            JOIN resumes r ON a.resume_id = r.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
        """
        history = await db.fetch(query, current_user["id"])
    except Exception as e:
        print(f"History Query Error (trying fallback): {e}")
        # Fallback query with only basic columns that are guaranteed to exist
        query = """
            SELECT a.id, a.user_id, a.resume_id, a.overall_score, a.ats_score, a.strengths, a.weaknesses, a.created_at, r.file_name, r.uploaded_at
            FROM analysis a
            JOIN resumes r ON a.resume_id = r.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
        """
        history = await db.fetch(query, current_user["id"])
    
    results = []
    for row in history:
        res = dict(row)
        json_fields = [
            'score_breakdown', 'ats_tips', 'strengths', 'weaknesses', 
            'suggestions', 'missing_keywords', 'salary_estimate', 
            'career_path', 'interview_questions'
        ]
        for field in json_fields:
            if res.get(field):
                try:
                    res[field] = json.loads(res[field])
                except:
                    pass
        
        res['id'] = str(res['id'])
        res['user_id'] = str(res['user_id'])
        res['resume_id'] = str(res['resume_id'])
        res['created_at'] = res['created_at'].isoformat()
        res['uploaded_at'] = res['uploaded_at'].isoformat()
        results.append(res)
        
    return results
