from fastapi import APIRouter, Depends, Response, HTTPException
from middleware.auth import get_current_user
from models.builder import ResumeBuilderRequest
from utils.db import get_db
from utils.pdf_generator import generate_resume_pdf
from groq import Groq
import os
import json

router = APIRouter(prefix="/builder", tags=["Resume Builder"])

@router.post("/save")
async def save_resume(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]

    # Convert complex objects to JSON strings for asyncpg
    experience_json = json.dumps([item.dict() for item in data.experience])
    education_json = json.dumps([item.dict() for item in data.education])
    projects_json = json.dumps([item.dict() for item in data.projects])
    certifications_json = json.dumps([item.dict() for item in data.certifications])
    skills_json = json.dumps(data.skills)

    # Check if user already has a saved resume
    existing = await db.fetchrow(
        "SELECT id FROM resume_builder WHERE user_id = $1", user_id
    )

    if existing:
        # Update existing
        await db.execute("""
            UPDATE resume_builder SET
            full_name=$1, email=$2, phone=$3, location=$4,
            linkedin=$5, portfolio=$6, summary=$7,
            experience=$8, education=$9, skills=$10,
            projects=$11, certifications=$12, updated_at=NOW()
            WHERE user_id=$13
        """,
        data.full_name, data.email, data.phone, data.location,
        data.linkedin, data.portfolio, data.summary,
        experience_json, education_json, skills_json,
        projects_json, certifications_json, user_id
        )
    else:
        # Insert new
        await db.execute("""
            INSERT INTO resume_builder
            (user_id, full_name, email, phone, location,
            linkedin, portfolio, summary, experience,
            education, skills, projects, certifications)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        """,
        user_id, data.full_name, data.email, data.phone,
        data.location, data.linkedin, data.portfolio, data.summary,
        experience_json, education_json, skills_json,
        projects_json, certifications_json
        )

    return {"message": "Resume saved successfully"}

@router.get("/get")
async def get_resume(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    row = await db.fetchrow(
        "SELECT * FROM resume_builder WHERE user_id = $1", user_id
    )
    
    if not row:
        return {}

    # Convert JSON strings back to lists
    result = dict(row)
    result["experience"] = json.loads(result["experience"]) if result["experience"] else []
    result["education"] = json.loads(result["education"]) if result["education"] else []
    result["skills"] = json.loads(result["skills"]) if result["skills"] else []
    result["projects"] = json.loads(result["projects"]) if result["projects"] else []
    result["certifications"] = json.loads(result["certifications"]) if result["certifications"] else []
    
    # Remove metadata
    result.pop("id", None)
    result.pop("user_id", None)
    result.pop("created_at", None)
    result.pop("updated_at", None)
    
    return result

@router.post("/generate-pdf")
async def generate_pdf_endpoint(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user)
):
    try:
        pdf_bytes = generate_resume_pdf(data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={data.full_name.replace(' ', '_')}_Resume.pdf"}
        )
    except Exception as e:
        print(f"PDF Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-summary")
async def ai_generate_summary(
    data: dict,
    current_user=Depends(get_current_user)
):
    try:
        # Get data from payload
        full_name = data.get('full_name', 'Professional')
        skills = data.get('skills', [])
        experience = data.get('experience', [])

        prompt = f"""
        Generate a professional resume summary for:
        Name: {full_name}
        Skills: {', '.join(skills)}
        Work Experience: {json.dumps(experience)}
        
        Keep it under 100 words, professional, impactful, and written in the first person.
        Output ONLY the summary text, nothing else.
        """

        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"summary": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete")
async def delete_resume(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    await db.execute("DELETE FROM resume_builder WHERE user_id = $1", user_id)
    return {"message": "Resume deleted successfully"}
