# Resume Builder — Complete Documentation
## AI Resume Analyzer Project

---

## 📋 Overview
User apni details fill kare → AI Professional Resume banaye → PDF download kare

---

## 🗂 Form Fields — Complete Structure

### 1. Personal Information
```
- Full Name        (text input) *required
- Email            (email input) *required
- Phone            (text input) *required
- Location         (text input) e.g. Karachi, Pakistan
- LinkedIn         (url input)  e.g. linkedin.com/in/username
- Portfolio        (url input)  e.g. myportfolio.vercel.app
```

### 2. Professional Summary
```
- Summary Text     (textarea) *required
  - Min: 50 chars
  - Max: 500 chars
  - AI can auto-generate from other fields
```

### 3. Work Experience (Multiple Entries)
```
Entry 1:
- Job Title        (text input) *required  e.g. Full Stack Developer
- Company          (text input) *required  e.g. Google
- Dates            (text input) *required  e.g. 2021 - Present
- Description      (textarea)  *required  e.g. Built AI powered apps...

Entry 2, 3... (Add More button)
```

### 4. Education (Multiple Entries)
```
Entry 1:
- Degree           (text input) *required  e.g. BS Computer Science
- School/University(text input) *required  e.g. FAST University
- Dates            (text input) *required  e.g. 2019 - 2023

Entry 2, 3... (Add More button)
```

### 5. Skills
```
- Skills Input     (tag input)
  - User types skill → press Enter → chip/tag added
  - Can remove individual skills
  - e.g. Next.js, Python, FastAPI, PostgreSQL
```

### 6. Projects (Optional Section)
```
Entry 1:
- Project Name     (text input)  e.g. Doctor Appointment System
- Tech Stack       (text input)  e.g. Next.js, FastAPI, Groq LLM
- Live Link        (url input)
- GitHub Link      (url input)
- Description      (textarea)

Entry 2, 3... (Add More button)
```

### 7. Certifications (Optional Section)
```
Entry 1:
- Certificate Name (text input)  e.g. Agentic AI Diploma
- Issuer           (text input)  e.g. Governor House IT Initiative
- Date             (text input)  e.g. 2024

Entry 2, 3... (Add More button)
```

---

## 🗄 Database Schema

### resume_builder Table
```sql
CREATE TABLE resume_builder (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Personal Info
  full_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  location      VARCHAR(100),
  linkedin      VARCHAR(255),
  portfolio     VARCHAR(255),

  -- Summary
  summary       TEXT,

  -- JSON Arrays
  experience    JSONB,   -- array of experience objects
  education     JSONB,   -- array of education objects
  skills        JSONB,   -- array of skill strings
  projects      JSONB,   -- array of project objects
  certifications JSONB,  -- array of certification objects

  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### JSON Structure Examples

**Experience JSONB:**
```json
[
  {
    "id": "1",
    "job_title": "Full Stack Developer",
    "company": "Freelance",
    "dates": "2024 - Present",
    "description": "Built AI powered web apps using Next.js and FastAPI"
  },
  {
    "id": "2",
    "job_title": "Junior Developer",
    "company": "XYZ Company",
    "dates": "2023 - 2024",
    "description": "Worked on React frontend development"
  }
]
```

**Education JSONB:**
```json
[
  {
    "id": "1",
    "degree": "Diploma - Computer Information Technology",
    "school": "Jinnah Polytechnic Institute",
    "dates": "2020 - 2023"
  }
]
```

**Skills JSONB:**
```json
["Next.js", "React", "FastAPI", "Python", "PostgreSQL", "Groq LLM", "JWT", "Tailwind CSS"]
```

**Projects JSONB:**
```json
[
  {
    "id": "1",
    "name": "AI Doctor Appointment System",
    "tech_stack": "Next.js, FastAPI, Groq LLM, PostgreSQL",
    "live_link": "https://project.vercel.app",
    "github_link": "https://github.com/ucdexpert/project",
    "description": "AI chatbot for automated appointment booking"
  }
]
```

---

## 🔧 Backend — FastAPI

### API Endpoints
```
POST   /builder/save          → Save resume data to database
GET    /builder/get           → Get saved resume data
POST   /builder/generate-pdf  → Generate PDF from data
POST   /builder/ai-summary    → AI generate professional summary
DELETE /builder/delete        → Delete saved resume
```

### Save Resume Route
```python
# routes/builder.py
from fastapi import APIRouter, Depends
from middleware.auth import get_current_user
from models.builder import ResumeBuilderRequest
from utils.db import get_db

router = APIRouter(prefix="/builder", tags=["Resume Builder"])

@router.post("/save")
async def save_resume(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]

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
        data.experience, data.education, data.skills,
        data.projects, data.certifications, user_id
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
        data.experience, data.education, data.skills,
        data.projects, data.certifications
        )

    return {"message": "Resume saved successfully"}


@router.post("/generate-pdf")
async def generate_pdf(
    data: ResumeBuilderRequest,
    current_user=Depends(get_current_user)
):
    # Generate PDF using reportlab or weasyprint
    pdf_bytes = generate_resume_pdf(data)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=resume.pdf"}
    )


@router.post("/ai-summary")
async def ai_generate_summary(
    data: dict,
    current_user=Depends(get_current_user)
):
    # Use Groq to generate professional summary
    prompt = f"""
    Generate a professional resume summary for:
    Name: {data['name']}
    Skills: {', '.join(data['skills'])}
    Experience: {data['experience']}
    Keep it under 100 words, professional and impactful.
    """

    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"summary": response.choices[0].message.content}
```

### PDF Generation (utils/pdf_generator.py)
```python
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.units import inch
from reportlab.lib import colors
import io

def generate_resume_pdf(data) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=0.5*inch, bottomMargin=0.5*inch,
                            leftMargin=0.7*inch, rightMargin=0.7*inch)

    styles = getSampleStyleSheet()
    story = []

    # ── Name ──────────────────────────────
    name_style = ParagraphStyle('Name', fontSize=22, fontName='Helvetica-Bold',
                                 textColor=colors.HexColor('#1a1a2e'))
    story.append(Paragraph(data.full_name, name_style))
    story.append(Spacer(1, 4))

    # ── Contact Info ──────────────────────
    contact = f"{data.email} | {data.phone} | {data.location}"
    if data.linkedin: contact += f" | {data.linkedin}"
    if data.portfolio: contact += f" | {data.portfolio}"
    story.append(Paragraph(contact, styles['Normal']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#3b82f6')))
    story.append(Spacer(1, 8))

    # ── Summary ───────────────────────────
    if data.summary:
        story.append(Paragraph("PROFESSIONAL SUMMARY", styles['Heading2']))
        story.append(Paragraph(data.summary, styles['Normal']))
        story.append(Spacer(1, 8))

    # ── Experience ────────────────────────
    if data.experience:
        story.append(Paragraph("WORK EXPERIENCE", styles['Heading2']))
        story.append(HRFlowable(width="100%", thickness=0.5))
        for exp in data.experience:
            story.append(Paragraph(f"<b>{exp['job_title']}</b> — {exp['company']}", styles['Normal']))
            story.append(Paragraph(exp['dates'], styles['Italic']))
            story.append(Paragraph(exp['description'], styles['Normal']))
            story.append(Spacer(1, 6))

    # ── Education ─────────────────────────
    if data.education:
        story.append(Paragraph("EDUCATION", styles['Heading2']))
        story.append(HRFlowable(width="100%", thickness=0.5))
        for edu in data.education:
            story.append(Paragraph(f"<b>{edu['degree']}</b> — {edu['school']}", styles['Normal']))
            story.append(Paragraph(edu['dates'], styles['Italic']))
            story.append(Spacer(1, 6))

    # ── Skills ────────────────────────────
    if data.skills:
        story.append(Paragraph("SKILLS", styles['Heading2']))
        story.append(HRFlowable(width="100%", thickness=0.5))
        story.append(Paragraph(" • ".join(data.skills), styles['Normal']))
        story.append(Spacer(1, 8))

    # ── Projects ──────────────────────────
    if data.projects:
        story.append(Paragraph("PROJECTS", styles['Heading2']))
        story.append(HRFlowable(width="100%", thickness=0.5))
        for proj in data.projects:
            story.append(Paragraph(f"<b>{proj['name']}</b> — {proj['tech_stack']}", styles['Normal']))
            story.append(Paragraph(proj['description'], styles['Normal']))
            if proj.get('live_link'):
                story.append(Paragraph(f"Live: {proj['live_link']}", styles['Normal']))
            story.append(Spacer(1, 6))

    doc.build(story)
    return buffer.getvalue()
```

---

## 🖥 Frontend — Next.js 14

### Pydantic Model (models/builder.py)
```python
from pydantic import BaseModel
from typing import List, Optional

class ExperienceItem(BaseModel):
    id: str
    job_title: str
    company: str
    dates: str
    description: str

class EducationItem(BaseModel):
    id: str
    degree: str
    school: str
    dates: str

class ProjectItem(BaseModel):
    id: str
    name: str
    tech_stack: str
    live_link: Optional[str] = ""
    github_link: Optional[str] = ""
    description: str

class CertificationItem(BaseModel):
    id: str
    name: str
    issuer: str
    date: str

class ResumeBuilderRequest(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    portfolio: Optional[str] = ""
    summary: Optional[str] = ""
    experience: Optional[List[ExperienceItem]] = []
    education: Optional[List[EducationItem]] = []
    skills: Optional[List[str]] = []
    projects: Optional[List[ProjectItem]] = []
    certifications: Optional[List[CertificationItem]] = []
```

### Zustand Store (stores/useBuilderStore.ts)
```typescript
import { create } from 'zustand'

interface Experience {
  id: string
  job_title: string
  company: string
  dates: string
  description: string
}

interface Education {
  id: string
  degree: string
  school: string
  dates: string
}

interface Project {
  id: string
  name: string
  tech_stack: string
  live_link: string
  github_link: string
  description: string
}

interface BuilderState {
  // Personal Info
  full_name: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
  summary: string

  // Arrays
  experience: Experience[]
  education: Education[]
  skills: string[]
  projects: Project[]

  // Actions
  updateField: (field: string, value: any) => void
  addExperience: () => void
  removeExperience: (id: string) => void
  updateExperience: (id: string, field: string, value: string) => void
  addEducation: () => void
  removeEducation: (id: string) => void
  updateEducation: (id: string, field: string, value: string) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  addProject: () => void
  removeProject: (id: string) => void
  updateProject: (id: string, field: string, value: string) => void
}

const useBuilderStore = create<BuilderState>((set) => ({
  full_name: '', email: '', phone: '',
  location: '', linkedin: '', portfolio: '', summary: '',
  experience: [{ id: '1', job_title: '', company: '', dates: '', description: '' }],
  education: [{ id: '1', degree: '', school: '', dates: '' }],
  skills: [],
  projects: [],

  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

  addExperience: () => set((state) => ({
    experience: [...state.experience, {
      id: Date.now().toString(),
      job_title: '', company: '', dates: '', description: ''
    }]
  })),

  removeExperience: (id) => set((state) => ({
    experience: state.experience.filter(e => e.id !== id)
  })),

  updateExperience: (id, field, value) => set((state) => ({
    experience: state.experience.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    )
  })),

  addEducation: () => set((state) => ({
    education: [...state.education, {
      id: Date.now().toString(),
      degree: '', school: '', dates: ''
    }]
  })),

  removeEducation: (id) => set((state) => ({
    education: state.education.filter(e => e.id !== id)
  })),

  updateEducation: (id, field, value) => set((state) => ({
    education: state.education.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    )
  })),

  addSkill: (skill) => set((state) => ({
    skills: [...state.skills, skill]
  })),

  removeSkill: (skill) => set((state) => ({
    skills: state.skills.filter(s => s !== skill)
  })),

  addProject: () => set((state) => ({
    projects: [...state.projects, {
      id: Date.now().toString(),
      name: '', tech_stack: '', live_link: '',
      github_link: '', description: ''
    }]
  })),

  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  updateProject: (id, field, value) => set((state) => ({
    projects: state.projects.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    )
  })),
}))

export default useBuilderStore
```

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────┐
│  Resume Builder                    [Download PDF]│
│  Fill in your details                           │
├──────────────────────┬──────────────────────────┤
│                      │                          │
│   📝 FORM            │   👁 LIVE PREVIEW        │
│                      │                          │
│  Personal Info       │  ┌────────────────────┐  │
│  ─────────────       │  │  Muhammad Uzair    │  │
│  Full Name [    ]    │  │  email | phone     │  │
│  Email     [    ]    │  │  ────────────────  │  │
│  Phone     [    ]    │  │  SUMMARY           │  │
│  Location  [    ]    │  │  ...               │  │
│  LinkedIn  [    ]    │  │  EXPERIENCE        │  │
│  Portfolio [    ]    │  │  Job Title         │  │
│                      │  │  Company | Dates   │  │
│  Summary             │  │  Description       │  │
│  ─────────           │  │                    │  │
│  [AI Generate ✨]    │  │  EDUCATION         │  │
│  [          ] textarea  │  │  Degree           │  │
│                      │  │  School | Dates    │  │
│  Experience          │  │                    │  │
│  ──────────          │  │  SKILLS            │  │
│  Job Title [    ]    │  │  Next.js • Python  │  │
│  Company   [    ]    │  └────────────────────┘  │
│  Dates     [    ]    │                          │
│  Description[   ]    │                          │
│  [+ Add More]        │                          │
│                      │                          │
│  Education           │                          │
│  ─────────           │                          │
│  Degree    [    ]    │                          │
│  School    [    ]    │                          │
│  Dates     [    ]    │                          │
│  [+ Add More]        │                          │
│                      │                          │
│  Skills              │                          │
│  ──────              │                          │
│  [Type + Enter]      │                          │
│  [Next.js ×][Python ×]                          │
│                      │                          │
│  [💾 Save]  [📥 Download PDF]                   │
└──────────────────────┴──────────────────────────┘
```

---

## ✨ Special Features

### 1. AI Summary Generator
```
User clicks "AI Generate ✨" button
       ↓
POST /builder/ai-summary
(sends name, skills, experience)
       ↓
Groq LLM generates professional summary
       ↓
Auto fills summary textarea
```

### 2. Live Preview
```
User types in form
       ↓
React state updates
       ↓
Preview panel updates in real time
       ↓
No need to submit to see result
```

### 3. Download PDF
```
User clicks "Download PDF"
       ↓
POST /builder/generate-pdf
(sends all form data)
       ↓
Backend generates PDF with reportlab
       ↓
Returns PDF bytes
       ↓
Browser auto downloads resume.pdf
```

### 4. Auto Save
```
User fills form
       ↓
Every 30 seconds auto save to database
       ↓
User can come back later and continue
       ↓
"Last saved: 2 mins ago" shown
```

---

## 📦 Extra Python Packages Needed
```txt
reportlab        ← PDF generation
weasyprint       ← Alternative PDF generator
```

---

## 🚀 Development Steps

| Step | Task | Time |
|------|------|------|
| 1 | Pydantic models + Database schema | 1 hour |
| 2 | Save/Get API endpoints | 2 hours |
| 3 | PDF Generation with reportlab | 3 hours |
| 4 | AI Summary endpoint | 1 hour |
| 5 | Frontend form with Zustand | 4 hours |
| 6 | Live preview panel | 2 hours |
| 7 | Download PDF button | 1 hour |
| 8 | Auto save feature | 1 hour |
| **Total** | | **~15 hours** |

---

*Built by Muhammad Uzair | github.com/ucdexpert*