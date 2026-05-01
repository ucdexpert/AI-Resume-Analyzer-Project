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
