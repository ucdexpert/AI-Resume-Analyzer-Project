# API & Backend Rules — AI Resume Analyzer

## 🛠 Tech Stack
- **Framework:** FastAPI (Python)
- **AI/LLM:** Groq API (using `llama3-70b`) for analysis and text generation.
- **PDF Processing:** `pdfplumber` or `PyMuPDF` (fitz) for high-accuracy text extraction.
- **Authentication:** JWT (JSON Web Tokens) with `python-jose` and `passlib`.
- **Environment:** `.env` for `GROQ_API_KEY` and `DATABASE_URL`.

## 📡 API Endpoints & Logic
| Method | Endpoint | Description | Feature Level |
|--------|----------|-------------|---------------|
| POST | `/analyze` | PDF upload → Text Extraction → AI Analysis (Score, Strengths, Weaknesses). | Level 1 |
| POST | `/match-job` | Compare Resume Text vs Job Description → Match % + Keywords. | Level 2 |
| POST | `/generate-cover-letter` | Resume + Company Data → Professional PDF/Text Cover Letter. | Level 3 |
| POST | `/interview-questions` | Resume Analysis → Technical/HR Questions with Answers. | Level 4 |
| POST | `/mock-interview` | Real-time chat endpoint for AI-driven mock interviews. | Level 5 |
| POST | `/salary-estimate` | AI Analysis → Market-based salary range estimation. | Level 4 |

## 🧠 AI Prompting & Analysis Standards
- **Resume Scoring:** Breakdown 100 points into: Formatting (20), Skills (20), Experience (20), Education (20), Summary (20).
- **ATS Logic:** Identify non-standard fonts, complex layouts, and keyword density.
- **Extraction:** Ensure the backend handles multi-column resume layouts correctly during PDF parsing.
- **Response Format:** All endpoints MUST return structured JSON for easy frontend consumption.

## 🏗 Backend Architecture
- `/routes`: Endpoint definitions grouped by feature (e.g., `analysis.py`, `auth.py`).
- `/models`: Pydantic models for request/response validation.
- `/utils`: Helper functions for PDF parsing, Groq API calling, and text processing.
- `main.py`: Entry point for the FastAPI application.

## 🔒 Security & Performance
- Validate file size (Max 5MB) and mime-type (application/pdf).
- Use asynchronous functions (`async def`) for I/O bound tasks like API calls and DB queries.
- Implement rate limiting to protect the Groq API usage.
