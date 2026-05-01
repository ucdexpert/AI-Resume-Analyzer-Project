# 🔧 Admin Panel — Complete Documentation
## AI Resume Analyzer — SaaS Admin System

---

## 📋 Table of Contents
1. Overview & Architecture
2. Database Schema
3. Backend (FastAPI) — Complete
4. Frontend (Next.js) — Complete
5. Authentication & Security
6. All Pages & Components
7. API Endpoints
8. Deployment

---

# 1. OVERVIEW & ARCHITECTURE

## Tech Stack
```
Frontend:  Next.js 14 + Tailwind CSS + shadcn/ui + Recharts
Backend:   FastAPI (Python)
Database:  PostgreSQL (NeonDB)
Auth:      JWT (separate admin tokens)
Charts:    Recharts
Tables:    TanStack Table
```

## Folder Structure
```
project/
├── frontend/
│   └── app/
│       └── admin/
│           ├── layout.tsx          ← Admin layout
│           ├── page.tsx            ← Redirect to dashboard
│           ├── login/
│           │   └── page.tsx        ← Admin login
│           ├── dashboard/
│           │   └── page.tsx        ← Overview stats
│           ├── users/
│           │   ├── page.tsx        ← Users list
│           │   └── [id]/
│           │       └── page.tsx    ← User detail
│           ├── analytics/
│           │   └── page.tsx        ← Analytics
│           ├── subscriptions/
│           │   └── page.tsx        ← Payments
│           ├── support/
│           │   └── page.tsx        ← Tickets
│           └── settings/
│               └── page.tsx        ← Settings
│
└── backend/
    └── routes/
        └── admin.py                ← All admin routes
    └── models/
        └── admin.py                ← Admin models
    └── middleware/
        └── admin_auth.py           ← Admin auth
```

---

# 2. DATABASE SCHEMA

## 2.1 Admins Table
```sql
CREATE TABLE admins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    role            VARCHAR(20) DEFAULT 'moderator',
    -- roles: superadmin, moderator
    is_active       BOOLEAN DEFAULT true,
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Default superadmin (password: admin123 — change immediately!)
INSERT INTO admins (name, email, password, role)
VALUES ('Super Admin', 'admin@airesume.pk', 
        '$2b$12$hashed_password_here', 'superadmin');
```

## 2.2 Support Tickets Table
```sql
CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    subject         VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'open',
    -- status: open, in_progress, resolved, closed
    priority        VARCHAR(20) DEFAULT 'normal',
    -- priority: low, normal, high, urgent
    admin_reply     TEXT,
    replied_by      UUID REFERENCES admins(id),
    replied_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

## 2.3 API Usage Logs Table
```sql
CREATE TABLE api_usage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint        VARCHAR(100) NOT NULL,
    tokens_used     INTEGER DEFAULT 0,
    response_time   INTEGER,  -- milliseconds
    status_code     INTEGER,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

## 2.4 Payments Table
```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    plan            VARCHAR(20) NOT NULL,
    -- plan: pro, enterprise
    amount          INTEGER NOT NULL,  -- in PKR
    currency        VARCHAR(5) DEFAULT 'PKR',
    payment_method  VARCHAR(50),
    -- method: jazzcash, easypaisa, stripe, bank_transfer
    transaction_id  VARCHAR(255),
    status          VARCHAR(20) DEFAULT 'pending',
    -- status: pending, completed, failed, refunded
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

## 2.5 Site Settings Table
```sql
CREATE TABLE site_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             VARCHAR(100) UNIQUE NOT NULL,
    value           TEXT,
    category        VARCHAR(50),
    -- category: general, email, payment, ai, plans
    updated_by      UUID REFERENCES admins(id),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value, category) VALUES
('site_name', 'AI Resume Analyzer', 'general'),
('site_url', 'https://skillsensepk.vercel.app/', 'general'),
('support_email', 'uzairkhilji307@gmail.com', 'general'),
('free_plan_limit', '3', 'plans'),
('pro_plan_price', '500', 'plans'),
('enterprise_plan_price', '2000', 'plans'),
('groq_daily_limit', '100000', 'ai'),
('per_user_daily_limit', '10000', 'ai'),
('maintenance_mode', 'false', 'general');
```

## 2.6 Update Users Table
```sql
-- Add admin-related columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS analyses_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_analyses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;
```

---

# 3. BACKEND — FASTAPI

## 3.1 Admin Auth Middleware
```python
# backend/middleware/admin_auth.py

from fastapi import Depends, HTTPException, Header
from utils.jwt import verify_token
from utils.db import get_db

async def get_current_admin(
    authorization: str = Header(...),
    db=Depends(get_db)
):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload or payload.get("type") != "admin":
        raise HTTPException(status_code=401, detail="Admin access required")
    
    admin = await db.fetchrow(
        "SELECT * FROM admins WHERE id = $1 AND is_active = true",
        payload["sub"]
    )
    
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    
    return dict(admin)


async def get_superadmin(admin=Depends(get_current_admin)):
    if admin["role"] != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return admin
```

## 3.2 Admin Models (Pydantic)
```python
# backend/models/admin.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_name: str
    admin_role: str

class DashboardStats(BaseModel):
    total_users: int
    new_users_today: int
    new_users_this_month: int
    total_analyses: int
    analyses_today: int
    total_revenue: int
    revenue_this_month: int
    active_users_today: int
    paid_users: int
    free_users: int
    api_tokens_used_today: int
    open_tickets: int

class UserListItem(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    analyses_count: int
    monthly_analyses: int
    is_banned: bool
    total_spent: int
    created_at: datetime
    last_active: Optional[datetime]

class UserDetail(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    plan_expires_at: Optional[datetime]
    analyses_count: int
    monthly_analyses: int
    is_banned: bool
    ban_reason: Optional[str]
    total_spent: int
    referral_code: Optional[str]
    created_at: datetime

class UpdateUserPlan(BaseModel):
    plan: str  # free, pro, enterprise
    expires_at: Optional[str] = None

class BanUserRequest(BaseModel):
    reason: str

class TicketReplyRequest(BaseModel):
    reply: str
    status: str  # open, in_progress, resolved, closed

class PaymentCreate(BaseModel):
    user_id: str
    plan: str
    amount: int
    payment_method: str
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class SiteSettingUpdate(BaseModel):
    value: str
```

## 3.3 Admin Routes — Complete
```python
# backend/routes/admin.py

from fastapi import APIRouter, Depends, HTTPException, Query
from middleware.admin_auth import get_current_admin, get_superadmin
from models.admin import *
from utils.db import get_db
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/admin", tags=["Admin"])


# ═══════════════════════════════════════
# AUTH
# ═══════════════════════════════════════

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(data: AdminLoginRequest, db=Depends(get_db)):
    admin = await db.fetchrow(
        "SELECT * FROM admins WHERE email = $1 AND is_active = true",
        data.email
    )
    if not admin or not verify_password(data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.execute(
        "UPDATE admins SET last_login = NOW() WHERE id = $1",
        admin["id"]
    )
    
    token = create_access_token({
        "sub": str(admin["id"]),
        "email": admin["email"],
        "type": "admin",
        "role": admin["role"]
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin_name": admin["name"],
        "admin_role": admin["role"]
    }


@router.get("/me")
async def get_admin_me(admin=Depends(get_current_admin)):
    return {
        "id": str(admin["id"]),
        "name": admin["name"],
        "email": admin["email"],
        "role": admin["role"]
    }


# ═══════════════════════════════════════
# DASHBOARD STATS
# ═══════════════════════════════════════

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    today = datetime.now().date()
    month_start = today.replace(day=1)
    
    stats = {}
    
    # Users
    stats["total_users"] = await db.fetchval("SELECT COUNT(*) FROM users")
    stats["new_users_today"] = await db.fetchval(
        "SELECT COUNT(*) FROM users WHERE DATE(created_at) = $1", today
    )
    stats["new_users_this_month"] = await db.fetchval(
        "SELECT COUNT(*) FROM users WHERE created_at >= $1", month_start
    )
    stats["paid_users"] = await db.fetchval(
        "SELECT COUNT(*) FROM users WHERE plan != 'free'"
    )
    stats["free_users"] = await db.fetchval(
        "SELECT COUNT(*) FROM users WHERE plan = 'free'"
    )
    stats["is_banned_users"] = await db.fetchval(
        "SELECT COUNT(*) FROM users WHERE is_banned = true"
    )
    
    # Analyses
    stats["total_analyses"] = await db.fetchval("SELECT COUNT(*) FROM analysis")
    stats["analyses_today"] = await db.fetchval(
        "SELECT COUNT(*) FROM analysis WHERE DATE(created_at) = $1", today
    )
    
    # Revenue
    stats["total_revenue"] = await db.fetchval(
        "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed'"
    ) or 0
    stats["revenue_this_month"] = await db.fetchval(
        "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed' AND created_at >= $1",
        month_start
    ) or 0
    
    # Active users today
    stats["active_users_today"] = await db.fetchval(
        "SELECT COUNT(DISTINCT user_id) FROM analysis WHERE DATE(created_at) = $1", today
    )
    
    # API tokens
    stats["api_tokens_used_today"] = await db.fetchval(
        "SELECT COALESCE(SUM(tokens_used), 0) FROM api_usage_logs WHERE DATE(created_at) = $1", today
    ) or 0
    
    # Support
    stats["open_tickets"] = await db.fetchval(
        "SELECT COUNT(*) FROM support_tickets WHERE status = 'open'"
    )
    
    return stats


@router.get("/dashboard/charts")
async def get_dashboard_charts(
    days: int = 30,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    # Daily signups last N days
    signups = await db.fetch("""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '$1 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """, days)
    
    # Daily analyses last N days
    analyses = await db.fetch("""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM analysis
        WHERE created_at >= NOW() - INTERVAL '$1 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """, days)
    
    # Daily revenue last N days
    revenue = await db.fetch("""
        SELECT DATE(created_at) as date, SUM(amount) as total
        FROM payments
        WHERE status = 'completed'
        AND created_at >= NOW() - INTERVAL '$1 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """, days)
    
    return {
        "signups": [{"date": str(r["date"]), "count": r["count"]} for r in signups],
        "analyses": [{"date": str(r["date"]), "count": r["count"]} for r in analyses],
        "revenue": [{"date": str(r["date"]), "total": r["total"] or 0} for r in revenue]
    }


# ═══════════════════════════════════════
# USER MANAGEMENT
# ═══════════════════════════════════════

@router.get("/users")
async def get_users(
    page: int = 1,
    limit: int = 20,
    search: str = "",
    plan: str = "",
    is_banned: bool = None,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    
    conditions = ["1=1"]
    params = []
    
    if search:
        params.append(f"%{search}%")
        conditions.append(f"(name ILIKE ${len(params)} OR email ILIKE ${len(params)})")
    
    if plan:
        params.append(plan)
        conditions.append(f"plan = ${len(params)}")
    
    if is_banned is not None:
        params.append(is_banned)
        conditions.append(f"is_banned = ${len(params)}")
    
    where = " AND ".join(conditions)
    
    total = await db.fetchval(f"SELECT COUNT(*) FROM users WHERE {where}", *params)
    
    users = await db.fetch(f"""
        SELECT id, name, email, plan, analyses_count, 
               monthly_analyses, is_banned, total_spent, 
               created_at
        FROM users 
        WHERE {where}
        ORDER BY created_at DESC
        LIMIT $%s OFFSET $%s
    """ % (len(params)+1, len(params)+2), *params, limit, offset)
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "users": [
            {**dict(u), "id": str(u["id"])} 
            for u in users
        ]
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    user = await db.fetchrow(
        "SELECT * FROM users WHERE id = $1::uuid", user_id
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's analyses
    analyses = await db.fetch("""
        SELECT id, overall_score, ats_score, created_at
        FROM analysis
        WHERE user_id = $1::uuid
        ORDER BY created_at DESC
        LIMIT 10
    """, user_id)
    
    # Get user's payments
    payments = await db.fetch("""
        SELECT id, plan, amount, payment_method, status, created_at
        FROM payments
        WHERE user_id = $1::uuid
        ORDER BY created_at DESC
    """, user_id)
    
    user_dict = dict(user)
    user_dict["id"] = str(user_dict["id"])
    user_dict.pop("password", None)
    
    return {
        "user": user_dict,
        "analyses": [
            {**dict(a), "id": str(a["id"])} 
            for a in analyses
        ],
        "payments": [
            {**dict(p), "id": str(p["id"])} 
            for p in payments
        ]
    }


@router.put("/users/{user_id}/plan")
async def update_user_plan(
    user_id: str,
    data: UpdateUserPlan,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    expires_at = None
    if data.expires_at:
        expires_at = datetime.fromisoformat(data.expires_at)
    
    await db.execute("""
        UPDATE users 
        SET plan = $1, plan_expires_at = $2
        WHERE id = $3::uuid
    """, data.plan, expires_at, user_id)
    
    return {"message": f"User plan updated to {data.plan}"}


@router.put("/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    data: BanUserRequest,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    await db.execute("""
        UPDATE users 
        SET is_banned = true, ban_reason = $1
        WHERE id = $2::uuid
    """, data.reason, user_id)
    
    return {"message": "User banned successfully"}


@router.put("/users/{user_id}/unban")
async def unban_user(
    user_id: str,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    await db.execute("""
        UPDATE users 
        SET is_banned = false, ban_reason = null
        WHERE id = $1::uuid
    """, user_id)
    
    return {"message": "User unbanned successfully"}


@router.put("/users/{user_id}/reset-usage")
async def reset_user_usage(
    user_id: str,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    await db.execute("""
        UPDATE users 
        SET monthly_analyses = 0, analysis_count = 0
        WHERE id = $1::uuid
    """, user_id)
    
    return {"message": "User usage reset successfully"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin=Depends(get_superadmin),  # Only superadmin
    db=Depends(get_db)
):
    await db.execute(
        "DELETE FROM users WHERE id = $1::uuid", user_id
    )
    return {"message": "User deleted successfully"}


# ═══════════════════════════════════════
# ANALYTICS
# ═══════════════════════════════════════

@router.get("/analytics/overview")
async def get_analytics_overview(
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    # Average scores
    avg_score = await db.fetchval(
        "SELECT ROUND(AVG(overall_score)) FROM analysis"
    )
    avg_ats = await db.fetchval(
        "SELECT ROUND(AVG(ats_score)) FROM analysis"
    )
    
    # Score distribution
    score_dist = await db.fetch("""
        SELECT 
            CASE 
                WHEN overall_score >= 80 THEN 'Excellent (80-100)'
                WHEN overall_score >= 60 THEN 'Good (60-79)'
                WHEN overall_score >= 40 THEN 'Average (40-59)'
                ELSE 'Poor (0-39)'
            END as range,
            COUNT(*) as count
        FROM analysis
        GROUP BY range
        ORDER BY range
    """)
    
    # Plan distribution
    plan_dist = await db.fetch("""
        SELECT plan, COUNT(*) as count
        FROM users
        GROUP BY plan
    """)
    
    # Total resumes
    total_resumes = await db.fetchval("SELECT COUNT(*) FROM resumes")
    
    return {
        "avg_score": avg_score or 0,
        "avg_ats_score": avg_ats or 0,
        "total_resumes": total_resumes,
        "score_distribution": [dict(r) for r in score_dist],
        "plan_distribution": [dict(r) for r in plan_dist]
    }


@router.get("/analytics/api-usage")
async def get_api_usage(
    days: int = 7,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    # Top endpoints
    top_endpoints = await db.fetch("""
        SELECT endpoint, COUNT(*) as calls, 
               SUM(tokens_used) as total_tokens
        FROM api_usage_logs
        WHERE created_at >= NOW() - INTERVAL '$1 days'
        GROUP BY endpoint
        ORDER BY calls DESC
        LIMIT 10
    """, days)
    
    # Top users by usage
    top_users = await db.fetch("""
        SELECT u.name, u.email, 
               SUM(l.tokens_used) as tokens,
               COUNT(l.id) as api_calls
        FROM api_usage_logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.created_at >= NOW() - INTERVAL '$1 days'
        GROUP BY u.id, u.name, u.email
        ORDER BY tokens DESC
        LIMIT 10
    """, days)
    
    # Daily token usage
    daily_tokens = await db.fetch("""
        SELECT DATE(created_at) as date,
               SUM(tokens_used) as tokens
        FROM api_usage_logs
        WHERE created_at >= NOW() - INTERVAL '$1 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """, days)
    
    return {
        "top_endpoints": [dict(r) for r in top_endpoints],
        "top_users": [dict(r) for r in top_users],
        "daily_tokens": [
            {"date": str(r["date"]), "tokens": r["tokens"]}
            for r in daily_tokens
        ]
    }


# ═══════════════════════════════════════
# PAYMENTS
# ═══════════════════════════════════════

@router.get("/payments")
async def get_payments(
    page: int = 1,
    limit: int = 20,
    status: str = "",
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    
    where = "1=1"
    params = []
    
    if status:
        params.append(status)
        where += f" AND p.status = ${len(params)}"
    
    total = await db.fetchval(
        f"SELECT COUNT(*) FROM payments p WHERE {where}", *params
    )
    
    payments = await db.fetch(f"""
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM payments p
        JOIN users u ON p.user_id = u.id
        WHERE {where}
        ORDER BY p.created_at DESC
        LIMIT ${len(params)+1} OFFSET ${len(params)+2}
    """, *params, limit, offset)
    
    return {
        "total": total,
        "page": page,
        "payments": [
            {**dict(p), 
             "id": str(p["id"]), 
             "user_id": str(p["user_id"])} 
            for p in payments
        ]
    }


@router.post("/payments")
async def create_payment(
    data: PaymentCreate,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    # Create payment record
    payment = await db.fetchrow("""
        INSERT INTO payments 
        (user_id, plan, amount, payment_method, transaction_id, status, notes)
        VALUES ($1::uuid, $2, $3, $4, $5, 'completed', $6)
        RETURNING id
    """, data.user_id, data.plan, data.amount, 
        data.payment_method, data.transaction_id, data.notes)
    
    # Update user plan
    expires_at = datetime.now() + timedelta(days=30)
    await db.execute("""
        UPDATE users 
        SET plan = $1, plan_expires_at = $2,
            total_spent = total_spent + $3
        WHERE id = $4::uuid
    """, data.plan, expires_at, data.amount, data.user_id)
    
    return {"message": "Payment recorded successfully", "id": str(payment["id"])}


@router.put("/payments/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    admin=Depends(get_superadmin),
    db=Depends(get_db)
):
    payment = await db.fetchrow(
        "SELECT * FROM payments WHERE id = $1::uuid", payment_id
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    await db.execute("""
        UPDATE payments SET status = 'refunded'
        WHERE id = $1::uuid
    """, payment_id)
    
    # Downgrade user to free
    await db.execute("""
        UPDATE users 
        SET plan = 'free', plan_expires_at = null
        WHERE id = $1::uuid
    """, payment["user_id"])
    
    return {"message": "Payment refunded and user downgraded to free"}


# ═══════════════════════════════════════
# SUPPORT TICKETS
# ═══════════════════════════════════════

@router.get("/support/tickets")
async def get_tickets(
    page: int = 1,
    limit: int = 20,
    status: str = "",
    priority: str = "",
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    conditions = ["1=1"]
    params = []
    
    if status:
        params.append(status)
        conditions.append(f"t.status = ${len(params)}")
    
    if priority:
        params.append(priority)
        conditions.append(f"t.priority = ${len(params)}")
    
    where = " AND ".join(conditions)
    
    total = await db.fetchval(
        f"SELECT COUNT(*) FROM support_tickets t WHERE {where}", *params
    )
    
    tickets = await db.fetch(f"""
        SELECT t.*, u.name as user_name, u.email as user_email
        FROM support_tickets t
        JOIN users u ON t.user_id = u.id
        WHERE {where}
        ORDER BY t.created_at DESC
        LIMIT ${len(params)+1} OFFSET ${len(params)+2}
    """, *params, limit, offset)
    
    return {
        "total": total,
        "tickets": [
            {**dict(t), "id": str(t["id"])} 
            for t in tickets
        ]
    }


@router.put("/support/tickets/{ticket_id}/reply")
async def reply_ticket(
    ticket_id: str,
    data: TicketReplyRequest,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    await db.execute("""
        UPDATE support_tickets
        SET admin_reply = $1, 
            status = $2,
            replied_by = $3::uuid,
            replied_at = NOW(),
            updated_at = NOW()
        WHERE id = $4::uuid
    """, data.reply, data.status, admin["id"], ticket_id)
    
    return {"message": "Ticket replied successfully"}


# ═══════════════════════════════════════
# SETTINGS
# ═══════════════════════════════════════

@router.get("/settings")
async def get_settings(
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    settings = await db.fetch("SELECT * FROM site_settings ORDER BY category")
    
    result = {}
    for s in settings:
        if s["category"] not in result:
            result[s["category"]] = {}
        result[s["category"]][s["key"]] = s["value"]
    
    return result


@router.put("/settings/{key}")
async def update_setting(
    key: str,
    data: SiteSettingUpdate,
    admin=Depends(get_superadmin),
    db=Depends(get_db)
):
    await db.execute("""
        UPDATE site_settings
        SET value = $1, updated_by = $2::uuid, updated_at = NOW()
        WHERE key = $3
    """, data.value, admin["id"], key)
    
    return {"message": f"Setting '{key}' updated"}


# ═══════════════════════════════════════
# ADMIN MANAGEMENT (Superadmin only)
# ═══════════════════════════════════════

@router.get("/admins")
async def get_admins(
    admin=Depends(get_superadmin),
    db=Depends(get_db)
):
    admins = await db.fetch(
        "SELECT id, name, email, role, is_active, last_login, created_at FROM admins"
    )
    return [
        {**dict(a), "id": str(a["id"])} for a in admins
    ]


@router.post("/admins")
async def create_admin(
    data: AdminLoginRequest,
    name: str,
    role: str = "moderator",
    admin=Depends(get_superadmin),
    db=Depends(get_db)
):
    hashed = hash_password(data.password)
    new_admin = await db.fetchrow("""
        INSERT INTO admins (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    """, name, data.email, hashed, role)
    
    return {"message": "Admin created", "id": str(new_admin["id"])}
```

## 3.4 Register Admin Router in main.py
```python
# In backend/main.py, add:
from routes import admin

app.include_router(admin.router, prefix="/api")
```

---

# 4. FRONTEND — NEXT.JS

## 4.1 Admin Layout
```tsx
// frontend/app/admin/layout.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ChartBar, Users, CreditCard, 
  ChatText, Gear, House, SignOut,
  Shield
} from '@phosphor-icons/react'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: House },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: ChartBar },
  { href: '/admin/subscriptions', label: 'Payments', icon: CreditCard },
  { href: '/admin/support', label: 'Support', icon: ChatText },
  { href: '/admin/settings', label: 'Settings', icon: Gear },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    const adminData = localStorage.getItem('admin-data')
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
    if (adminData) {
      setAdmin(JSON.parse(adminData))
    }
  }, [])

  if (pathname === '/admin/login') return <>{children}</>

  const handleLogout = () => {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-data')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 
        flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-brand-primary" weight="fill" />
            <div>
              <p className="text-white font-bold">Admin Panel</p>
              <p className="text-gray-500 text-xs">AI Resume Analyzer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 
                  rounded-xl transition-all ${
                  active 
                    ? 'bg-brand-primary text-black font-bold' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                <Icon size={20} weight={active ? "fill" : "regular"} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Admin info */}
        <div className="p-4 border-t border-white/10">
          {admin && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">{admin.name}</p>
                <p className="text-gray-500 text-xs capitalize">{admin.role}</p>
              </div>
              <button onClick={handleLogout}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                <SignOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
```

## 4.2 Admin Login Page
```tsx
// frontend/app/admin/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from '@phosphor-icons/react'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      
      localStorage.setItem('admin-token', data.access_token)
      localStorage.setItem('admin-data', JSON.stringify({
        name: data.admin_name,
        role: data.admin_role
      }))
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Shield size={48} className="text-brand-primary mx-auto mb-4" weight="fill" />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm">AI Resume Analyzer</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 
            text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            className="w-full bg-white/10 text-white rounded-xl 
              px-4 py-3 outline-none border border-white/10 
              focus:border-brand-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white/10 text-white rounded-xl 
              px-4 py-3 outline-none border border-white/10 
              focus:border-brand-primary"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-brand-primary text-black font-bold 
              py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : '🔐 Login to Admin'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 4.3 Dashboard Page
```tsx
// frontend/app/admin/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.get('/admin/dashboard/stats'),
      adminApi.get('/admin/dashboard/charts')
    ]).then(([statsRes, chartsRes]) => {
      setStats(statsRes.data)
      setCharts(chartsRes.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-white">Loading...</div>

  const statCards = [
    { label: 'Total Users', value: stats.total_users, color: 'blue', icon: '👥' },
    { label: 'New Today', value: `+${stats.new_users_today}`, color: 'green', icon: '🆕' },
    { label: 'Paid Users', value: stats.paid_users, color: 'amber', icon: '💎' },
    { label: 'Total Analyses', value: stats.total_analyses, color: 'purple', icon: '📊' },
    { label: 'Today Analyses', value: stats.analyses_today, color: 'cyan', icon: '📈' },
    { label: 'Total Revenue', value: `PKR ${stats.total_revenue?.toLocaleString()}`, color: 'green', icon: '💰' },
    { label: 'Monthly Revenue', value: `PKR ${stats.revenue_this_month?.toLocaleString()}`, color: 'emerald', icon: '📅' },
    { label: 'Open Tickets', value: stats.open_tickets, color: 'red', icon: '🎫' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">📊 Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label}
            className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-gray-400 text-sm">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signups Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Daily Signups (30 days)</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.signups}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Daily Revenue (PKR)</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 4.4 Admin API Helper
```typescript
// frontend/lib/adminApi.ts
import axios from 'axios'

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-data')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export { adminApi }
```

---

# 5. API ENDPOINTS SUMMARY

```
AUTH:
POST   /api/admin/login              ← Admin login
GET    /api/admin/me                 ← Get admin info

DASHBOARD:
GET    /api/admin/dashboard/stats    ← Overview stats
GET    /api/admin/dashboard/charts   ← Chart data

USERS:
GET    /api/admin/users              ← List all users
GET    /api/admin/users/{id}         ← User detail
PUT    /api/admin/users/{id}/plan    ← Change plan
PUT    /api/admin/users/{id}/ban     ← Ban user
PUT    /api/admin/users/{id}/unban   ← Unban user
PUT    /api/admin/users/{id}/reset-usage ← Reset usage
DELETE /api/admin/users/{id}         ← Delete user (superadmin)

ANALYTICS:
GET    /api/admin/analytics/overview ← Analytics overview
GET    /api/admin/analytics/api-usage ← API usage stats

PAYMENTS:
GET    /api/admin/payments           ← List payments
POST   /api/admin/payments           ← Record payment
PUT    /api/admin/payments/{id}/refund ← Refund

SUPPORT:
GET    /api/admin/support/tickets    ← List tickets
PUT    /api/admin/support/tickets/{id}/reply ← Reply

SETTINGS:
GET    /api/admin/settings           ← All settings
PUT    /api/admin/settings/{key}     ← Update setting

ADMIN MGMT (Superadmin):
GET    /api/admin/admins             ← List admins
POST   /api/admin/admins             ← Create admin
```

---

# 6. DEVELOPMENT PLAN

| Week | Task |
|------|------|
| **Day 1** | DB schema + admin table migration |
| **Day 2** | Backend auth + middleware |
| **Day 3** | Dashboard stats + charts API |
| **Day 4** | User management API |
| **Day 5** | Analytics + payments API |
| **Day 6** | Support + settings API |
| **Day 7** | Admin login + layout frontend |
| **Day 8** | Dashboard page frontend |
| **Day 9** | Users page frontend |
| **Day 10** | Analytics + payments frontend |
| **Day 11** | Support + settings frontend |
| **Day 12** | Testing + bug fixes |
| **Day 13** | Deploy + production test |
| **Day 14** | Polish + documentation |

---

# 7. SECURITY RULES

```
✅ Admin routes MUST use admin JWT token (not user token)
✅ Superadmin only: Delete user, Refund, Create admin
✅ Admin panel at /admin/* route
✅ Separate localStorage key: 'admin-token'
✅ Rate limiting on /admin/login (5 attempts)
✅ All admin actions logged
✅ NEVER expose admin routes to regular users
```

---

*AI Resume Analyzer — Admin Panel Documentation*
*Built by Muhammad Uzair | github.com/ucdexpert*