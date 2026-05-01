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
    signups = await db.fetch(f"""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    
    # Daily analyses last N days
    analyses = await db.fetch(f"""
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM analysis
        WHERE created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    
    # Daily revenue last N days
    revenue = await db.fetch(f"""
        SELECT DATE(created_at) as date, SUM(amount) as total
        FROM payments
        WHERE status = 'completed'
        AND created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    
    return {
        "signups": [{"date": str(r["date"]), "count": r["count"]} for r in signups],
        "analyses": [{"date": str(r["date"]), "count": r["count"]} for r in analyses],
        "revenue": [{"date": str(r["date"]), "total": float(r["total"] or 0)} for r in revenue]
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
        LIMIT ${len(params)+1} OFFSET ${len(params)+2}
    """, *params, limit, offset)
    
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
        SET monthly_analyses = 0, analyses_count = 0
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
        "avg_score": int(avg_score or 0),
        "avg_ats_score": int(avg_ats or 0),
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
    top_endpoints = await db.fetch(f"""
        SELECT endpoint, COUNT(*) as calls, 
               SUM(tokens_used) as total_tokens
        FROM api_usage_logs
        WHERE created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY endpoint
        ORDER BY calls DESC
        LIMIT 10
    """)
    
    # Top users by usage
    top_users = await db.fetch(f"""
        SELECT u.name, u.email, 
               SUM(l.tokens_used) as tokens,
               COUNT(l.id) as api_calls
        FROM api_usage_logs l
        JOIN users u ON l.user_id = u.id
        WHERE l.created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY u.id, u.name, u.email
        ORDER BY tokens DESC
        LIMIT 10
    """)
    
    # Daily token usage
    daily_tokens = await db.fetch(f"""
        SELECT DATE(created_at) as date,
               SUM(tokens_used) as tokens
        FROM api_usage_logs
        WHERE created_at >= NOW() - INTERVAL '{days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    """)
    
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
# NEWSLETTER & CONTACT INQUIRIES
# ═══════════════════════════════════════

@router.get("/newsletter")
async def get_newsletter_subscribers(
    page: int = 1,
    limit: int = 50,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    total = await db.fetchval("SELECT COUNT(*) FROM newsletter_subscriptions")
    subscribers = await db.fetch("""
        SELECT * FROM newsletter_subscriptions 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
    """, limit, offset)
    
    return {
        "total": total,
        "page": page,
        "subscribers": [dict(s) for s in subscribers]
    }

@router.delete("/newsletter/{subscriber_id}")
async def delete_newsletter_subscriber(
    subscriber_id: str,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    await db.execute("DELETE FROM newsletter_subscriptions WHERE id = $1::uuid", subscriber_id)
    return {"message": "Subscriber removed successfully"}

@router.get("/contact-inquiries")
async def get_contact_inquiries(
    page: int = 1,
    limit: int = 20,
    admin=Depends(get_current_admin),
    db=Depends(get_db)
):
    offset = (page - 1) * limit
    total = await db.fetchval("SELECT COUNT(*) FROM contact_inquiries")
    inquiries = await db.fetch("""
        SELECT * FROM contact_inquiries 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
    """, limit, offset)
    
    return {
        "total": total,
        "page": page,
        "inquiries": [dict(i) for i in inquiries]
    }


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
