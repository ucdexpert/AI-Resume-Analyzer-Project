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

    # 2. Check User Limit (Counting actual records in DB for accuracy)
    user_data = await db.fetchrow("SELECT plan FROM users WHERE id = $1", current_user["id"])
    actual_count = await db.fetchval("SELECT COUNT(*) FROM analysis WHERE user_id = $1", current_user["id"])
    
    # 3. Extract Text
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

    text = extract_text_from_pdf(content)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

    # 4. Check for existing analysis (Cache)
    # This allows users to re-upload the same file without using a new slot
    existing_analysis_record = await db.fetchrow("""
        SELECT a.*, r.file_name, r.raw_text
        FROM analysis a
        JOIN resumes r ON a.resume_id = r.id
        WHERE a.user_id = $1 
        AND r.raw_text = $2
        ORDER BY a.created_at DESC LIMIT 1
    """, current_user["id"], text)

    if existing_analysis_record:
        res = dict(existing_analysis_record)
        json_fields = ['score_breakdown', 'ats_tips', 'strengths', 'weaknesses', 'suggestions', 'missing_keywords', 'salary_estimate', 'career_path', 'interview_questions']
        for field in json_fields:
            if res.get(field):
                try: res[field] = json.loads(res[field]) if isinstance(res[field], str) else res[field]
                except: pass
        res['id'] = str(res['id'])
        res['user_id'] = str(res['user_id'])
        res['resume_id'] = str(res['resume_id'])
        return AnalysisResponse(**res)

    # 5. NOW enforce limit for NEW analyses
    if user_data["plan"] == "free" and actual_count >= 3:
        raise HTTPException(status_code=403, detail="Free limit reached (3/3). Please upgrade to Pro for unlimited analyses.")

    # 6. AI Analysis
    try:
        analysis_result = analyze_resume_with_ai(text, job_description, lang)
        if not analysis_result:
            raise HTTPException(status_code=500, detail="AI Analysis failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Error: {e}")

    # 7. Save to Database
    try:
        resume_id = await db.fetchval("INSERT INTO resumes (user_id, file_name, raw_text) VALUES ($1, $2, $3) RETURNING id", current_user["id"], file.filename, text)

        analysis_id = await db.fetchval("""
            INSERT INTO analysis (
                user_id, resume_id, overall_score, score_breakdown, ats_score, ats_tips,
                strengths, weaknesses, suggestions, missing_keywords,
                industry_feedback, salary_estimate, career_path, interview_questions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
        """, current_user["id"], resume_id, analysis_result.get("overall_score"), json.dumps(analysis_result.get("score_breakdown")), analysis_result.get("ats_score"), json.dumps(analysis_result.get("ats_tips")), json.dumps(analysis_result.get("strengths")), json.dumps(analysis_result.get("weaknesses")), json.dumps(analysis_result.get("suggestions")), json.dumps(analysis_result.get("missing_keywords")), analysis_result.get("industry_feedback"), json.dumps(analysis_result.get("salary_estimate")), json.dumps(analysis_result.get("career_path")), json.dumps(analysis_result.get("interview_questions")))
        
        analysis_result["id"] = str(analysis_id)
        
        # Increment legacy counter for compatibility
        await db.execute("UPDATE users SET analysis_count = analysis_count + 1 WHERE id = $1", current_user["id"])

        background_tasks.add_task(send_analysis_email, current_user["email"], current_user["name"], analysis_result.get("overall_score"))
    except Exception as e:
        print(f"DB Error: {e}")

    analysis_result["raw_text"] = text
    return analysis_result

@router.post("/share")
async def share_analysis(
    req: dict,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    analysis_id = req.get("analysis_id")
    if not analysis_id:
        raise HTTPException(status_code=400, detail="analysis_id is required")
    
    import uuid
    share_token = str(uuid.uuid4())
    
    # Ensure column exists (one-time check/migration)
    try:
        await db.execute("ALTER TABLE analysis ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE")
    except:
        pass

    await db.execute(
        "UPDATE analysis SET share_token = $1::uuid WHERE id = $2::uuid AND user_id = $3::uuid",
        share_token, analysis_id, current_user["id"]
    )
    
    return {"share_token": share_token}

@router.get("/shared/{share_token}")
async def get_shared_analysis(
    share_token: str,
    db=Depends(get_db)
):
    row = await db.fetchrow("""
        SELECT a.*, r.file_name, r.raw_text
        FROM analysis a
        JOIN resumes r ON a.resume_id = r.id
        WHERE a.share_token = $1::uuid
    """, share_token)
    
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found or link expired")
    
    res = dict(row)
    json_fields = [
        'score_breakdown', 'ats_tips', 'strengths', 'weaknesses', 
        'suggestions', 'missing_keywords', 'salary_estimate', 
        'career_path', 'interview_questions'
    ]
    for field in json_fields:
        if res.get(field):
            try:
                res[field] = json.loads(res[field]) if isinstance(res[field], str) else res[field]
            except:
                pass
    
    res['id'] = str(res['id'])
    res['user_id'] = str(res['user_id'])
    res['resume_id'] = str(res['resume_id'])
    return res

@router.get("/history")
async def get_analysis_history(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    rows = await db.fetch("""
        SELECT a.*, r.file_name, r.uploaded_at
        FROM analysis a
        JOIN resumes r ON a.resume_id = r.id
        WHERE a.user_id = $1::uuid
        ORDER BY a.created_at DESC
    """, current_user["id"])
    
    history = []
    for row in rows:
        res = dict(row)
        json_fields = [
            'score_breakdown', 'ats_tips', 'strengths', 'weaknesses', 
            'suggestions', 'missing_keywords', 'salary_estimate', 
            'career_path', 'interview_questions'
        ]
        for field in json_fields:
            if res.get(field):
                try:
                    res[field] = json.loads(res[field]) if isinstance(res[field], str) else res[field]
                except:
                    pass
        res['id'] = str(res['id'])
        res['user_id'] = str(res['user_id'])
        res['resume_id'] = str(res['resume_id'])
        history.append(res)
    
    return history
