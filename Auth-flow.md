# JWT Authentication Flow — AI Resume Analyzer

## 🔐 Tech Stack
- **Backend:** FastAPI + python-jose + passlib
- **Frontend:** Next.js 14 + Zustand + axios
- **Database:** PostgreSQL (NeonDB)
- **Token:** JWT (JSON Web Token)
- **Password:** bcrypt hashing

---

## 👤 User Journey — Step by Step

```
User Opens Website
       ↓
Is User Logged In? (check localStorage for token)
       ↓
   YES → Go to Dashboard
   NO  → Show Landing Page
              ↓
       Sign Up or Login?
       ↓              ↓
   Sign Up          Login
       ↓              ↓
  Fill Form      Fill Form
       ↓              ↓
  API Call        API Call
       ↓              ↓
 JWT Token       JWT Token
       ↓              ↓
Save in localStorage
       ↓
  Go to Dashboard
       ↓
  Upload Resume
       ↓
  View Analysis
       ↓
  View History
       ↓
   Logout → Clear Token → Landing Page
```

---

## 📋 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,  -- bcrypt hashed
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Resumes Table
```sql
CREATE TABLE resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name   VARCHAR(255),
  raw_text    TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Analysis Table
```sql
CREATE TABLE analysis (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  resume_id        UUID REFERENCES resumes(id) ON DELETE CASCADE,
  overall_score    INTEGER,
  ats_score        INTEGER,
  strengths        JSONB,
  weaknesses       JSONB,
  suggestions      JSONB,
  missing_keywords JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Backend — FastAPI

### Folder Structure
```
backend/
├── main.py
├── .env
├── requirements.txt
├── routes/
│   ├── auth.py        ← signup, login, logout
│   ├── analysis.py    ← analyze resume
│   └── history.py     ← user history
├── models/
│   ├── user.py        ← Pydantic models
│   └── analysis.py
├── utils/
│   ├── jwt.py         ← create/verify token
│   ├── hash.py        ← password hashing
│   └── db.py          ← database connection
└── middleware/
    └── auth.py        ← protect routes
```

---

### Step 1 — Environment Variables (.env)
```env
DATABASE_URL=postgresql://user:password@neondb.com/dbname
SECRET_KEY=your_super_secret_key_here_make_it_long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GROQ_API_KEY=your_groq_api_key
```

---

### Step 2 — Password Hashing (utils/hash.py)
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

---

### Step 3 — JWT Token (utils/jwt.py)
```python
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# Create Token
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verify Token
def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

---

### Step 4 — Pydantic Models (models/user.py)
```python
from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_name: str
    user_email: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
```

---

### Step 5 — Auth Routes (routes/auth.py)
```python
from fastapi import APIRouter, HTTPException, Depends
from models.user import SignupRequest, LoginRequest, TokenResponse
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from utils.db import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ─── SIGNUP ────────────────────────────────
@router.post("/signup", response_model=TokenResponse)
async def signup(data: SignupRequest, db=Depends(get_db)):
    # 1. Check email already exists
    existing = await db.fetchrow(
        "SELECT id FROM users WHERE email = $1", data.email
    )
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Hash password
    hashed = hash_password(data.password)

    # 3. Save user to database
    user = await db.fetchrow(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        data.name, data.email, hashed
    )

    # 4. Create JWT token
    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user["name"],
        "user_email": user["email"]
    }


# ─── LOGIN ─────────────────────────────────
@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db=Depends(get_db)):
    # 1. Find user by email
    user = await db.fetchrow(
        "SELECT * FROM users WHERE email = $1", data.email
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 2. Verify password
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # 3. Create JWT token
    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user["name"],
        "user_email": user["email"]
    }


# ─── GET CURRENT USER ──────────────────────
@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user
```

---

### Step 6 — Protect Routes (middleware/auth.py)
```python
from fastapi import Depends, HTTPException, Header
from utils.jwt import verify_token
from utils.db import get_db

async def get_current_user(
    authorization: str = Header(...),
    db=Depends(get_db)
):
    # 1. Extract token from header
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.split(" ")[1]

    # 2. Verify token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

    # 3. Get user from database
    user = await db.fetchrow(
        "SELECT id, name, email FROM users WHERE id = $1",
        payload["sub"]
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
```

---

### Step 7 — Protected Analysis Route
```python
# routes/analysis.py
from fastapi import APIRouter, Depends, UploadFile, File
from middleware.auth import get_current_user

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)  # ← Protected!
):
    # Only logged in users can analyze
    user_id = current_user["id"]

    # ... PDF parsing + Groq AI analysis logic ...

    # Save to database with user_id
    await db.execute(
        "INSERT INTO analysis (user_id, resume_id, overall_score, ...) VALUES ($1, $2, $3, ...)",
        user_id, resume_id, score
    )

    return {"score": score, "strengths": strengths, ...}


# Get User History
@router.get("/history")
async def get_history(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    history = await db.fetch(
        "SELECT * FROM analysis WHERE user_id = $1 ORDER BY created_at DESC",
        user_id
    )
    return history
```

---

## 🖥 Frontend — Next.js 14

### Folder Structure
```
frontend/
├── app/
│   ├── page.tsx           ← Landing page
│   ├── signup/page.tsx    ← Signup page
│   ├── login/page.tsx     ← Login page
│   ├── dashboard/page.tsx ← Protected page
│   └── history/page.tsx   ← Protected page
├── components/
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── AuthGuard.tsx  ← Protect pages
├── stores/
│   └── useAuthStore.ts    ← Zustand auth store
└── lib/
    └── api.ts             ← Axios with token
```

---

### Step 1 — Zustand Auth Store (stores/useAuthStore.ts)
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  user: { name: string; email: string } | null
  isLoggedIn: boolean
  login: (token: string, user: any) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      login: (token, user) => set({
        token,
        user,
        isLoggedIn: true
      }),

      logout: () => set({
        token: null,
        user: null,
        isLoggedIn: false
      }),
    }),
    { name: 'auth-storage' }  // saves in localStorage
  )
)

export default useAuthStore
```

---

### Step 2 — Axios with Token (lib/api.ts)
```typescript
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({ baseURL: BASE_URL })

// Auto attach token to every request
api.interceptors.request.use((config) => {
  const token = JSON.parse(
    localStorage.getItem('auth-storage') || '{}'
  )?.state?.token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

### Step 3 — Signup Page (app/signup/page.tsx)
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useAuthStore from '@/stores/useAuthStore'

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, form)
      login(res.data.access_token, {
        name: res.data.user_name,
        email: res.data.user_email
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Create Account</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg px-4 py-3 mb-4 outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg px-4 py-3 mb-4 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg px-4 py-3 mb-6 outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="text-gray-400 text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 hover:underline">Login</a>
        </p>
      </div>
    </div>
  )
}
```

---

### Step 4 — Login Page (app/login/page.tsx)
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useAuthStore from '@/stores/useAuthStore'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, form)
      login(res.data.access_token, {
        name: res.data.user_name,
        email: res.data.user_email
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Welcome Back</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg px-4 py-3 mb-4 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-white/10 text-white rounded-lg px-4 py-3 mb-6 outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-gray-400 text-center mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-400 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  )
}
```

---

### Step 5 — Auth Guard (components/auth/AuthGuard.tsx)
```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/useAuthStore'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn])

  if (!isLoggedIn) return null

  return <>{children}</>
}

// Usage in any protected page:
// export default function DashboardPage() {
//   return (
//     <AuthGuard>
//       <Dashboard />
//     </AuthGuard>
//   )
// }
```

---

### Step 6 — Navbar with User Info
```typescript
'use client'
import useAuthStore from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <h1 className="text-white font-bold text-xl">AI Resume Analyzer</h1>

      {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <span className="text-gray-400">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-lg hover:bg-red-600/30"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <a href="/login" className="text-gray-300 hover:text-white px-4 py-2">Login</a>
          <a href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Sign Up</a>
        </div>
      )}
    </nav>
  )
}
```

---

## 🔄 Complete Auth Flow Diagram

```
SIGNUP FLOW:
User fills form → POST /auth/signup
       ↓
Backend checks email not duplicate
       ↓
Hash password with bcrypt
       ↓
Save user to PostgreSQL
       ↓
Generate JWT token (7 days expiry)
       ↓
Return token + user info
       ↓
Frontend saves in Zustand + localStorage
       ↓
Redirect to /dashboard ✅


LOGIN FLOW:
User fills form → POST /auth/login
       ↓
Backend finds user by email
       ↓
Verify password with bcrypt
       ↓
Generate new JWT token
       ↓
Return token + user info
       ↓
Frontend saves in Zustand + localStorage
       ↓
Redirect to /dashboard ✅


PROTECTED REQUEST FLOW:
User uploads resume → POST /analysis/analyze
       ↓
Axios interceptor adds token to header
Authorization: Bearer <token>
       ↓
Backend middleware verifies token
       ↓
Extract user_id from token
       ↓
Process request with user_id
       ↓
Save result linked to user_id
       ↓
Return response ✅


LOGOUT FLOW:
User clicks Logout
       ↓
Zustand clears token + user
       ↓
localStorage cleared
       ↓
Redirect to / (landing page) ✅


TOKEN EXPIRED FLOW:
User makes any request
       ↓
Backend returns 401 Unauthorized
       ↓
Axios interceptor catches 401
       ↓
Auto logout + redirect to /login ✅
```

---

## 📦 Python Requirements (Backend)
```txt
fastapi
uvicorn
python-jose[cryptography]
passlib[bcrypt]
python-dotenv
asyncpg
pydantic[email]
python-multipart
groq
pdfplumber
PyMuPDF
```

---

## 📦 Node Requirements (Frontend)
```txt
next
react
typescript
tailwindcss
zustand
axios
```

---

## 🚀 API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|--------------|-------------|
| POST | /auth/signup | ❌ No | Register new user |
| POST | /auth/login | ❌ No | Login user |
| GET | /auth/me | ✅ Yes | Get current user |
| POST | /analysis/analyze | ✅ Yes | Analyze resume |
| GET | /analysis/history | ✅ Yes | Get user history |
| POST | /analysis/match-job | ✅ Yes | Match with job |
| POST | /analysis/cover-letter | ✅ Yes | Generate cover letter |
| POST | /analysis/interview | ✅ Yes | Mock interview |

---

*Built by Muhammad Uzair | github.com/ucdexpert*