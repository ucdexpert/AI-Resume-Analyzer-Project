# Frontend Design Skill — AI Resume Analyzer

## 🎯 Purpose
Build a production-grade, visually stunning frontend for the AI Resume Analyzer.
Users upload resumes and get AI-powered analysis, scores, and suggestions.

---

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Icons:** @phosphor-icons/react
- **Animations:** Framer Motion
- **Components:**
  - `react-dropzone` — PDF upload
  - `react-circular-progressbar` — Score display (0-100)
  - `axios` — API calls to FastAPI backend

---

## 🎨 Design Direction

### Theme: **Dark Professional + Neon Accents**
- **Background:** Deep dark (#0a0a0f) with subtle grid pattern
- **Primary Color:** Electric blue (#3b82f6)
- **Accent:** Neon green (#22c55e) for scores and success
- **Warning:** Amber (#f59e0b) for weaknesses
- **Text:** White (#ffffff) and gray (#94a3b8)
- **Cards:** Dark glass morphism (rgba(255,255,255,0.05)) with blur

### Typography
- **Heading Font:** `Syne` (bold, futuristic)
- **Body Font:** `DM Sans` (clean, readable)
- **Code/Score Font:** `JetBrains Mono` (technical feel)

---

## 🏗 Project Structure

```
/app
  /page.tsx          → Landing/Upload Page
  /dashboard/        → Analysis Results
  /interview/        → Mock Interview Page
  /builder/          → Resume Builder Page
  /layout.tsx        → Root Layout

/components
  /ui/               → shadcn/ui components
  /upload/
    DropZone.tsx     → PDF drag & drop upload
    FilePreview.tsx  → Uploaded file preview
  /analysis/
    ScoreCard.tsx    → Circular score display
    StrengthsList.tsx
    WeaknessList.tsx
    SuggestionCard.tsx
    ATSScore.tsx
    KeywordMatch.tsx
  /interview/
    ChatBubble.tsx   → Interview Q&A UI
    ScoreBadge.tsx
  /shared/
    Navbar.tsx
    LoadingSpinner.tsx
    ProgressBar.tsx

/stores
  useAnalysisStore.ts  → Zustand store for analysis state
  useUserStore.ts      → User session store

/lib
  api.ts              → Axios API calls
  utils.ts            → Helper functions
```

---

## 📄 Pages & Components

### 1. Landing / Upload Page (`/`)
```
Layout:
- Full screen dark background with animated grid
- Center: Large heading "Analyze Your Resume with AI"
- Subheading: "Get instant feedback, ATS score, and job match"
- DropZone: Dashed border box, drag & drop PDF here
- Upload Button: Neon blue gradient
- Below: 3 feature cards (Score, ATS, Job Match)
```

**DropZone Component:**
```tsx
// Accepts: PDF only, Max 5MB
// States: idle, dragging, uploading, error
// Shows: file name + size after upload
// Animation: pulse border on drag over
```

---

### 2. Dashboard / Results Page (`/dashboard`)
```
Layout:
- Top: Overall Score (large circular progress bar, 0-100)
- Grid: 4 score cards (Formatting, Skills, Experience, Education)
- Section: Strengths (green cards with checkmark icons)
- Section: Weaknesses (amber cards with warning icons)
- Section: Suggestions (blue cards with lightbulb icons)
- Section: ATS Score + Tips
- Section: Missing Keywords (tag chips)
- Bottom: Action buttons (Improve Resume, Generate Cover Letter)
```

**ScoreCard Component:**
```tsx
// Props: score (number), label (string), color (string)
// Display: Circular progressbar with animated fill
// Color: Green (80-100), Blue (60-79), Amber (40-59), Red (0-39)
```

---

### 3. Job Match Page (`/match`)
```
Layout:
- Left: Resume summary
- Right: Job Description textarea (paste JD here)
- Center: Match % meter (large animated bar)
- Below: Matched Keywords (green chips)
- Below: Missing Keywords (red chips)
- Bottom: "How to improve match" suggestions
```

---

### 4. Mock Interview Page (`/interview`)
```
Layout:
- Top: Interview progress bar (Question 1 of 10)
- Center: Question card (large, readable)
- Below: Answer textarea
- Button: Submit Answer
- After submit: AI feedback card with score (0-10)
- Bottom: Next Question button
- End: Final score + detailed report
```

---

### 5. Cover Letter Page (`/cover-letter`)
```
Layout:
- Left: Form (Job Title, Company Name, Your Name)
- Right: Generated cover letter preview
- Button: Copy to clipboard / Download as PDF
```

---

## 🎭 Animations & Interactions

```css
/* Page Load */
- Staggered fade-in for all cards (0.1s delay each)
- Score circle animates from 0 to final value on load

/* Upload */
- DropZone border pulses blue on drag-over
- Progress bar fills while uploading
- Success: Green checkmark with bounce animation

/* Dashboard */
- Score numbers count up (0 → final score)
- Cards slide in from bottom
- Keyword chips pop in one by one

/* Hover States */
- Cards: Subtle lift (translateY -2px) + glow
- Buttons: Gradient shift + scale(1.02)
```

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 768px) | Single column, stacked cards |
| Tablet (768-1024px) | 2 column grid |
| Desktop (> 1024px) | 3 column grid, sidebar layout |

---

## ♿ Accessibility

- All interactive elements keyboard navigable
- ARIA labels on all icon buttons
- Color contrast ratio minimum 4.5:1
- Loading states announced to screen readers
- Error messages clearly visible

---

## 🔄 Loading States

```tsx
// Analyzing resume: Full screen loader with progress steps
// Steps shown:
// 1. ✅ Extracting text from PDF...
// 2. ✅ Analyzing content with AI...
// 3. ✅ Calculating scores...
// 4. ✅ Generating suggestions...
// 5. ✅ Done! Redirecting to dashboard...
```

---

## 🌐 API Integration

```ts
// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Upload & Analyze
export const analyzeResume = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`${BASE_URL}/analyze`, formData)
  return res.data
}

// Job Match
export const matchJob = async (resumeText: string, jobDescription: string) => {
  const res = await axios.post(`${BASE_URL}/match-job`, { resumeText, jobDescription })
  return res.data
}

// Cover Letter
export const generateCoverLetter = async (data: CoverLetterInput) => {
  const res = await axios.post(`${BASE_URL}/generate-cover-letter`, data)
  return res.data
}

// Interview Questions
export const getInterviewQuestions = async (resumeText: string) => {
  const res = await axios.post(`${BASE_URL}/interview-questions`, { resumeText })
  return res.data
}
```

---

## 🎨 CSS Variables

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-card: rgba(255, 255, 255, 0.05);
  --color-primary: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-text: #ffffff;
  --color-muted: #94a3b8;
  --border-color: rgba(255, 255, 255, 0.1);
  --blur: blur(10px);
  --shadow: 0 0 30px rgba(59, 130, 246, 0.15);
  --radius: 12px;
}
```

---

## ✅ UI Standards

- **Never** use plain white background — always dark theme
- **Always** show loading state during API calls
- **Always** validate file before upload (PDF only, max 5MB)
- **Never** use generic purple gradients
- **Always** show error messages clearly in red
- **Always** use glass morphism for cards
- **Use** neon glow effects on important scores

---

*Built by Muhammad Uzair | github.com/ucdexpert | uzair-portfolio01.vercel.app*