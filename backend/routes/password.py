from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from utils.db import get_db
from utils.hash import hash_password
import secrets
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

from utils.notifications import send_password_reset_email

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db=Depends(get_db)):
    user = await db.fetchrow("SELECT id, name FROM users WHERE email = $1", data.email)
    if not user:
        # Don't reveal if user exists for security, but say email sent
        return {"message": "If an account exists with this email, a reset link has been sent."}
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(hours=1)
    
    await db.execute("""
        INSERT INTO reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
    """, user["id"], token, expires_at)
    
    # Send real reset email
    send_password_reset_email(user["name"], data.email, token)
    
    return {"message": "If an account exists with this email, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db=Depends(get_db)):
    token_data = await db.fetchrow("""
        SELECT user_id, expires_at, used 
        FROM reset_tokens 
        WHERE token = $1
    """, data.token)
    
    if not token_data or token_data["used"] or token_data["expires_at"] < datetime.now():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    hashed_pwd = hash_password(data.new_password)
    
    # Update password
    await db.execute("UPDATE users SET password = $1 WHERE id = $2", hashed_pwd, token_data["user_id"])
    # Mark token as used
    await db.execute("UPDATE reset_tokens SET used = true WHERE token = $1", data.token)
    
    return {"message": "Password reset successfully. You can now login."}
