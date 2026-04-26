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
    template_id: Optional[str] = "modern"
    theme_color: Optional[str] = "#00E5FF"
