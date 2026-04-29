from fastapi import APIRouter, Depends, Response, HTTPException
from pydantic import BaseModel
from middleware.auth import get_current_user
from models.builder import ResumeBuilderRequest
from utils.db import get_db
from utils.pdf_generator import generate_resume_pdf
from utils.docx_generator import generate_resume_docx
from utils.groq_client import generate_bullet_points
from groq import Groq
import os
import json
from typing import Optional

router = APIRouter(prefix="/builder", tags=["Resume Builder"])

class BulletPointRequest(BaseModel):
    job_title: str
    company: str
    description: Optional[str] = ""

@router.post("/save")
async def save_resume(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]

    experience_json = json.dumps([item.dict() for item in data.experience])
    education_json = json.dumps([item.dict() for item in data.education])
    projects_json = json.dumps([item.dict() for item in data.projects])
    certifications_json = json.dumps([item.dict() for item in data.certifications])
    skills_json = json.dumps(data.skills)

    existing = await db.fetchrow(
        "SELECT id FROM resume_builder WHERE user_id = $1", user_id
    )

    if existing:
        await db.execute("""
            UPDATE resume_builder SET
            full_name=$1, email=$2, phone=$3, location=$4,
            linkedin=$5, portfolio=$6, summary=$7,
            experience=$8, education=$9, skills=$10,
            projects=$11, certifications=$12, 
            template_id=$13, theme_color=$14,
            updated_at=NOW()
            WHERE user_id=$15
        """,
        data.full_name, data.email, data.phone, data.location,
        data.linkedin, data.portfolio, data.summary,
        experience_json, education_json, skills_json,
        projects_json, certifications_json,
        data.template_id, data.theme_color,
        user_id
        )
    else:
        await db.execute("""
            INSERT INTO resume_builder
            (user_id, full_name, email, phone, location,
            linkedin, portfolio, summary, experience,
            education, skills, projects, certifications,
            template_id, theme_color)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        """,
        user_id, data.full_name, data.email, data.phone,
        data.location, data.linkedin, data.portfolio, data.summary,
        experience_json, education_json, skills_json,
        projects_json, certifications_json,
        data.template_id, data.theme_color
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

    result = dict(row)
    result["experience"] = json.loads(result["experience"]) if result["experience"] else []
    result["education"] = json.loads(result["education"]) if result["education"] else []
    result["skills"] = json.loads(result["skills"]) if result["skills"] else []
    result["projects"] = json.loads(result["projects"]) if result["projects"] else []
    result["certifications"] = json.loads(result["certifications"]) if result["certifications"] else []
    
    # Convert UUIDs to strings
    result["id"] = str(result["id"])
    result["user_id"] = str(result["user_id"])
    if "public_id" in result and result["public_id"]:
        result["public_id"] = str(result["public_id"])
    else:
        result["public_id"] = None # or some default value if needed
    
    return result

@router.get("/public/{public_id}")
async def get_public_resume(
    public_id: str,
    db=Depends(get_db)
):
    row = await db.fetchrow(
        "SELECT * FROM resume_builder WHERE public_id = $1", public_id
    )
    
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found")

    result = dict(row)
    result["experience"] = json.loads(result["experience"]) if result["experience"] else []
    result["education"] = json.loads(result["education"]) if result["education"] else []
    result["skills"] = json.loads(result["skills"]) if result["skills"] else []
    result["projects"] = json.loads(result["projects"]) if result["projects"] else []
    result["certifications"] = json.loads(result["certifications"]) if result["certifications"] else []
    
    # Minimal data for public view
    return {
        "full_name": result["full_name"],
        "email": result["email"],
        "phone": result["phone"],
        "location": result["location"],
        "linkedin": result["linkedin"],
        "portfolio": result["portfolio"],
        "summary": result["summary"],
        "experience": result["experience"],
        "education": result["education"],
        "skills": result["skills"],
        "projects": result["projects"],
        "certifications": result["certifications"],
        "template_id": result["template_id"],
        "theme_color": result["theme_color"]
    }

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

@router.post("/generate-docx")
async def generate_docx_endpoint(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user)
):
    try:
        docx_bytes = generate_resume_docx(data.dict())
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={data.full_name.replace(' ', '_')}_Resume.docx"}
        )
    except Exception as e:
        print(f"DOCX Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-txt")
async def generate_txt_endpoint(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user)
):
    try:
        text_content = f"{data.full_name}\n{data.email} | {data.phone} | {data.location}\n"
        if data.linkedin: text_content += f"LinkedIn: {data.linkedin}\n"
        if data.portfolio: text_content += f"Portfolio: {data.portfolio}\n"
        
        text_content += f"\nPROFESSIONAL SUMMARY\n{data.summary}\n"
        
        text_content += "\nWORK EXPERIENCE\n"
        for exp in data.experience:
            text_content += f"{exp.job_title} at {exp.company} ({exp.dates})\n{exp.description}\n\n"
            
        text_content += "\nEDUCATION\n"
        for edu in data.education:
            text_content += f"{edu.degree}, {edu.school} ({edu.dates})\n"
            
        text_content += f"\nSKILLS\n{', '.join(data.skills)}\n"
        
        return Response(
            content=text_content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={data.full_name.replace(' ', '_')}_Resume.txt"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-summary")
async def ai_generate_summary(
    data: dict,
    current_user=Depends(get_current_user)
):
    try:
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
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )

        return {"summary": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-bullet-points")
async def ai_generate_bullets(
    req: BulletPointRequest,
    current_user=Depends(get_current_user)
):
    result = generate_bullet_points(req.job_title, req.company, req.description or "")
    if not result:
        raise HTTPException(status_code=500, detail="Failed to generate bullet points.")
    return result

@router.delete("/delete")
async def delete_resume(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    await db.execute("DELETE FROM resume_builder WHERE user_id = $1", user_id)
    return {"message": "Resume deleted successfully"}

@router.post("/share")
async def share_resume(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    try:
        import uuid
        
        # Generate proper UUID
        share_uuid = str(uuid.uuid4())
        
        # Check if resume exists
        existing = await db.fetchrow(
            "SELECT id FROM resume_builder WHERE user_id = $1",
            current_user["id"]
        )
        
        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Please save your resume first"
            )
        
        # Store UUID in public_id column
        await db.execute("""
            UPDATE resume_builder 
            SET public_id = $1::uuid
            WHERE user_id = $2
        """, share_uuid, current_user["id"])
        
        frontend_url = os.getenv(
            "FRONTEND_URL",
            "https://ai-resume-analyzer-pk.vercel.app"
        )
        
        return {
            "share_url": f"{frontend_url}/share/resume/{share_uuid}"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Share error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )
