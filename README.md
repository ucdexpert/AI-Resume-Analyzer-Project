# 🚀 AI Resume Analyzer & Builder

An advanced, full-stack application designed to help job seekers optimize their resumes using AI. Features include real-time AI analysis, a professional resume builder with live preview, and high-fidelity PDF exports.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20FastAPI%20|%20PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Key Features

### 🔍 AI Resume Analysis
- **Upload & Parse:** Extract text from PDF resumes automatically.
- **Score Card:** Get an overall resume score based on industry standards.
- **Detailed Insights:** Receive lists of strengths, weaknesses, and keyword matches.
- **Interview Prep:** AI-generated interview questions tailored to your experience.

### 📝 Professional Resume Builder
- **Multi-section Form:** Easily manage Personal Info, Experience, Education, Projects, and Certifications.
- **AI Summary Generator:** One-click professional summary generation using Groq LLM.
- **Live Preview:** See your changes in real-time with an A4-standard layout.
- **Auto-Save:** Never lose progress with 30-second interval automatic saving.

### 📄 Professional Exports
- **Analysis Report:** Export your AI insights to PDF.
- **High-Fidelity Resume:** Generate a pixel-perfect, recruiter-ready PDF using ReportLab.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **State Management:** Zustand
- **Styling:** Tailwind CSS (Dark Professional Theme)
- **Animations:** Framer Motion
- **Icons:** Phosphor Icons

**Backend:**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (NeonDB) with `asyncpg`
- **AI Engine:** Groq Cloud API (Llama 3.3 70B Versatile)
- **PDF Engines:** ReportLab & FPDF2

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL Database (e.g., Neon.tech)
- Groq API Key

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=your_postgresql_url
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Initialize the database:
```bash
python init_db.py
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Run the development server:
```bash
npm run dev
```

---

## 📂 Project Structure

```text
├── backend/
│   ├── models/       # Pydantic & DB Models
│   ├── routes/       # API Endpoints (Auth, Builder, Analysis)
│   ├── utils/        # AI logic, PDF generation, DB helpers
│   └── main.py       # FastAPI Entry point
├── frontend/
│   ├── app/          # Next.js Pages & Layouts
│   ├── components/   # UI Components (Analysis, Builder, Shared)
│   ├── lib/          # API & Translation utilities
│   └── stores/       # Zustand State Management
└── README.md
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author
**Muhammad Uzair** - [GitHub](https://github.com/your-username)
