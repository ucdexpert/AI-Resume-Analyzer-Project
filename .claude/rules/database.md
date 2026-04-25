# Database & Auth Rules — AI Resume Analyzer

## 🛠 Tech Stack
- **Database:** PostgreSQL (NeonDB) for primary data storage.
- **ORM:** SQLAlchemy or Tortoise ORM for FastAPI integration.
- **Authentication:** Supabase Auth (or custom JWT with FastAPI as specified in requirements).
- **Environment:** `DATABASE_URL` for NeonDB connection string.

## 🗄 Database Schema (Core Entities)
### 1. Users
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password_hash`: String
- `created_at`: Timestamp

### 2. Resumes
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `file_url`: String (Path to file or Cloud Storage URL)
- `raw_text`: Text (Extracted content)
- `uploaded_at`: Timestamp

### 3. Analysis Reports
- `id`: UUID (Primary Key)
- `resume_id`: UUID (Foreign Key)
- `overall_score`: Integer (0-100)
- `ats_score`: Integer (0-100)
- `strengths`: JSON/Array
- `weaknesses`: JSON/Array
- `suggestions`: JSON/Array
- `missing_keywords`: JSON (Grouped by Category)
- `metadata`: JSON (Formatting, Skills, Experience scores)

### 4. Interviews & Mock Sessions (Level 5)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `resume_id`: UUID (Foreign Key)
- `chat_history`: JSON/Text
- `final_score`: Integer

## 🚦 Implementation Rules
- **Migrations:** Use Alembic for handling PostgreSQL migrations.
- **Performance:** Use indexing on `user_id` and `resume_id` for fast lookups.
- **Security:** 
  - Never store plain-text passwords.
  - Implement Row Level Security (RLS) if using Supabase directly.
  - Ensure all database connections use SSL.
- **Data Retention:** Store only what is necessary for the AI to perform analysis; provide options for users to delete their resumes/data.
