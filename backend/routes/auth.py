from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from utils.db import get_db
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from middleware.auth import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address
import re
import os
import secrets
import httpx
from fastapi.responses import RedirectResponse
from utils.notifications import send_verification_email

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.get("/google")
async def google_login():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    scope = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
    
    url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}"
    return {"url": url}

@router.get("/google/callback")
async def google_callback(code: str, db=Depends(get_db)):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    
    # 1. Exchange code for token
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        })
        token_data = token_res.json()
        print(f"DEBUG: Google Token Data: {token_data}")
        
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail=f"Failed to get access token: {token_data.get('error_description', 'Unknown error')}")
        
    # 2. Get user info
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_info = user_res.json()
        print(f"DEBUG: Google User Info: {user_info}")
        
    email = user_info.get("email")
    if not email:
        # Check alternative keys
        email = user_info.get("email_address")
        
    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google. Ensure you have granted email access.")

    name = user_info.get("name") or user_info.get("given_name") or email.split('@')[0]
    google_id = str(user_info.get("sub") or user_info.get("id"))
    
    # 3. Optimize DB logic: Get user or create in one/two efficient calls
    # We use sub (Google ID) for more reliable lookup
    user = await db.fetchrow("SELECT id, name, email, analysis_count, is_verified FROM users WHERE google_id = $1 OR email = $2", google_id, email)
    
    if not user:
        # Create new user
        user = await db.fetchrow("""
            INSERT INTO users (name, email, google_id, is_verified, plan)
            VALUES ($1, $2, $3, true, 'free')
            ON CONFLICT (email) DO UPDATE SET google_id = EXCLUDED.google_id, is_verified = true
            RETURNING id, name, email, analysis_count, is_verified
        """, name, email, google_id)
    
    # 4. Generate app token
    token = create_access_token({"sub": str(user["id"])})
    
    # Redirect back to frontend with minimal payload
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return RedirectResponse(url=f"{frontend_url}/login?token={token}&name={user['name']}&email={user['email']}")

@router.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, data: SignupRequest, db=Depends(get_db)):
    # 1. Password Strength Validation
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    
    # 2. Check if user exists
    existing = await db.fetchrow("SELECT id FROM users WHERE email = $1", data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 3. Create user with verification token
    hashed_pwd = hash_password(data.password)
    verify_token = secrets.token_urlsafe(32)
    
    user = await db.fetchrow(
        """
        INSERT INTO users (name, email, password, verification_token, is_verified)
        VALUES ($1, $2, $3, $4, false)
        RETURNING id, name, email
        """,
        data.name, data.email, hashed_pwd, verify_token
    )

    # Send real verification email
    send_verification_email(user["name"], user["email"], verify_token)

    # 4. Generate token
    token = create_access_token({"sub": str(user["id"])})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user["name"],
        "user_email": user["email"],
        "analysis_count": 0
    }

@router.get("/verify-email")
async def verify_email(token: str, db=Depends(get_db)):
    user = await db.fetchrow("SELECT id FROM users WHERE verification_token = $1", token)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    await db.execute(
        "UPDATE users SET is_verified = true, verification_token = null WHERE id = $1",
        user["id"]
    )
    return {"message": "Email verified successfully!"}

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, data: LoginRequest, db=Depends(get_db)):
    user = await db.fetchrow("SELECT * FROM users WHERE email = $1", data.email)
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["id"])})
    user_dict = dict(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user_dict["name"],
        "user_email": user_dict["email"],
        "analysis_count": user_dict.get("analysis_count", 0)
    }

@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    user_dict = dict(current_user)
    return {
        "id": str(user_dict["id"]),
        "name": user_dict["name"],
        "email": user_dict["email"],
        "analysis_count": user_dict.get("analysis_count", 0),
        "is_verified": user_dict.get("is_verified", False)
    }
