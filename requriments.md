# AI Resume Analyzer — Requirements Document

## 📌 Project Overview
An AI-powered Resume Analyzer web application that analyzes resumes, provides scores, suggests improvements, and helps users land their dream job.

**Frontend:** Next.js + Tailwind CSS → Deploy on **Vercel**  
**Backend:** FastAPI (Python) → Deploy on **Hugging Face Spaces**  
**AI:** Groq LLM API  
**Database:** PostgreSQL (NeonDB)

---

## 🗂️ Project Structure

```
ai-resume-analyzer/
├── frontend/          # Next.js App
│   ├── app/
│   ├── components/
│   └── public/
├── backend/           # FastAPI App
│   ├── main.py
│   ├── routes/
│   ├── models/
│   └── utils/
└── requirements.md
```

---

## ✅ Level 1 — Basic Features

### 1.1 Resume PDF Upload
- User can upload resume in PDF format
- Max file size: 5MB
- Extract text from PDF using PyMuPDF or pdfplumber

### 1.2 Overall Score (0-100)
- AI analyzes resume and gives an overall score
- Score breakdown:
  - Formatting: 20 points
  - Skills Section: 20 points
  - Experience: 20 points
  - Education: 20 points
  - Summary/Objective: 20 points

### 1.3 Strengths & Weaknesses
- AI lists top 3 strengths of the resume
- AI lists top 3 weaknesses of the resume

### 1.4 Improvement Suggestions
- AI gives 5 specific actionable suggestions to improve the resume

---

## ✅ Level 2 — Intermediate Features

### 2.1 ATS Score
- Check if resume is ATS (Applicant Tracking System) friendly
- Score out of 100
- Tips to improve ATS score

### 2.2 Job Description Match
- User pastes a job description
- AI compares resume with job description
- Shows match percentage (0-100%)
- Shows matched keywords
- Shows missing keywords

### 2.3 Missing Keywords
- AI identifies important keywords missing from resume
- Grouped by category: Technical Skills, Soft Skills, Industry Terms

### 2.4 Section Checker
- Check if all important sections exist:
  - ✅ Contact Information
  - ✅ Professional Summary
  - ✅ Work Experience
  - ✅ Education
  - ✅ Skills
  - ✅ Projects
  - ✅ Certifications (optional)

---

## ✅ Level 3 — Advanced Features

### 3.1 Auto Resume Improver
- AI rewrites weak sections of resume
- User can copy improved version
- Before/After comparison view

### 3.2 Cover Letter Generator
- User provides job title + company name
- AI generates a professional cover letter
- Based on resume content

### 3.3 LinkedIn Summary Generator
- AI generates a LinkedIn bio/summary from resume
- Character limit friendly (2600 chars)

### 3.4 Multiple Resume Compare
- Upload 2 resumes
- AI compares and tells which is stronger
- Detailed comparison report

---

## ✅ Level 4 — Pro Features

### 4.1 Industry Specific Analysis
- User selects industry: Tech / Marketing / Finance / Healthcare
- AI gives industry-specific feedback

### 4.2 Salary Estimator
- AI estimates salary range based on resume
- Based on skills, experience, location

### 4.3 Interview Questions Generator
- AI reads resume and generates likely interview questions
- Categorized: Technical / HR / Behavioral
- With suggested answers

### 4.4 Career Path Suggester
- AI analyzes resume and suggests best career paths
- Short term (1-2 years) and long term (5 years) goals

---

## ✅ Level 5 — God Level Features

### 5.1 AI Mock Interview
- Resume upload karo
- AI generates interview questions from resume
- User types answers
- AI scores each answer (0-10)
- AI gives improvement tips per answer
- Final interview score

### 5.2 Resume Builder
- Build resume from scratch using AI
- Fill simple form → AI generates professional resume
- Download as PDF

### 5.3 Real Time Job Matcher
- Resume analyze karo
- AI suggests best matching job roles
- With required skills gap analysis

### 5.4 Multi Language Support
- Support: English, Urdu, Arabic
- Resume in any language can be analyzed

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | FastAPI (Python) |
| AI/LLM | Groq API (llama3-70b) |
| PDF Parsing | pdfplumber / PyMuPDF |
| Database | PostgreSQL (NeonDB) |
| Auth | JWT Authentication |
| Frontend Deploy | Vercel |
| Backend Deploy | Hugging Face Spaces |

---

## 📦 Python Dependencies (Backend)

```txt
fastapi
uvicorn
groq
pdfplumber
PyMuPDF
python-multipart
psycopg2-binary
python-jose
passlib
pydantic
python-dotenv
```

---

## 📦 Node Dependencies (Frontend)

```txt
next
react
tailwindcss
axios
react-dropzone
react-circular-progressbar
```

---

## 🔐 Environment Variables

### Backend (.env)
```
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_neondb_url
SECRET_KEY=your_jwt_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=your_huggingface_space_url
```

---

## 🚀 Development Plan

| Week | Tasks |
|------|-------|
| Week 1 | PDF Upload + Score + Strengths/Weaknesses + ATS Score |
| Week 2 | Job Description Match + Missing Keywords + Cover Letter Generator |
| Week 3 | Auto Resume Rewriter + Interview Questions Generator |
| Week 4 | Salary Estimator + Career Path Suggester + AI Mock Interview |

---

## 🌐 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /analyze | Upload resume & get full analysis |
| POST | /match-job | Match resume with job description |
| POST | /generate-cover-letter | Generate cover letter |
| POST | /generate-linkedin | Generate LinkedIn summary |
| POST | /interview-questions | Generate interview questions |
| POST | /mock-interview | Start AI mock interview |
| POST | /salary-estimate | Estimate salary range |
| POST | /career-path | Suggest career paths |

---

## 🎯 MVP (Minimum Viable Product)
Start with these features first:
1. ✅ PDF Upload
2. ✅ Overall Score
3. ✅ Strengths & Weaknesses
4. ✅ ATS Score
5. ✅ Improvement Suggestions

**Deploy MVP first → Then add features one by one!**

---

*Built by Muhammad Uzair | github.com/ucdexpert*