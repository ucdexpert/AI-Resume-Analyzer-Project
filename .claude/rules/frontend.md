# Frontend Rules — AI Resume Analyzer

## 🛠 Tech Stack & Tools
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui for modern, professional UI.
- **State Management:** Zustand (for global analysis state and user session).
- **Icons:** `@phosphor-icons/react` for consistent iconography.
- **Specialized Components:**
  - `react-dropzone`: For PDF uploads.
  - `react-circular-progressbar`: For displaying scores (0-100).
  - `axios`: For API communication with FastAPI backend.

## 🏗 Architectural Guidelines
- **Project Structure:**
  - `/app`: Pages, layouts, and API route handlers.
  - `/components`: Atomistic UI components and complex feature blocks.
  - `/lib`: Utility functions and shared helpers.
  - `/stores`: Zustand store definitions.
- **Conventions:**
  - Strict TypeScript: No `any`. Use interfaces for all data structures.
  - Functional Components: Use React Hooks exclusively.
  - Responsive First: Ensure the layout works seamlessly from mobile to desktop.
  - Modern Aesthetics: Use subtle gradients, shadows, and spacing for a "Pro" feel.

## 🚀 Feature Roadmap (Frontend Requirements)
### Level 1: MVP Essentials
- **Upload Page:** Drag-and-drop PDF upload with size validation (Max 5MB).
- **Dashboard:** Display Overall Score, Strengths, Weaknesses, and Suggestions.
### Level 2 & 3: Intermediate/Advanced
- **ATS Panel:** Specialized view for ATS compatibility score and tips.
- **Comparison View:** Side-by-side view for "Auto Resume Improver" (Before/After).
- **Forms:** Input fields for Job Descriptions and Company names for Cover Letter generation.
### Level 4 & 5: Pro/God Level
- **Interview Simulator:** Interactive UI for Mock Interviews with real-time feedback.
- **Resume Builder:** Form-to-PDF builder interface.
- **Multilingual Toggle:** Support for English, Urdu, and Arabic.

## 🎨 UI/UX Standards
- Mobile-first design with a clean, professional look.
- Follow the design language suggested in `Main-requriments.jpg`.
- Use professional typography and clear visual hierarchy for analysis reports.