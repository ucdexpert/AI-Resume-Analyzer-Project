from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from utils.db import get_db
from utils.hash import hash_password, verify_password
from utils.jwt import create_access_token
from middleware.auth import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address
import re

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
@limiter.limit("5/minute")
async def signup(request: Request, data: SignupRequest, db=Depends(get_db)):
    # 1. Password Strength Validation (Phase 8)
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search("[a-z]", data.password) or not re.search("[0-9]", data.password):
        raise HTTPException(status_code=400, detail="Password must contain both letters and numbers.")

    # 2. Check if user exists
    existing = await db.fetchrow("SELECT id FROM users WHERE email = $1", data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 3. Create user
    hashed_pwd = hash_password(data.password)
    user = await db.fetchrow(
        """
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email
        """,
        data.name, data.email, hashed_pwd
    )

    # 4. Generate token
    token = create_access_token({"sub": str(user["id"])})
    user_dict = dict(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_name": user_dict["name"],
        "user_email": user_dict["email"],
        "analysis_count": user_dict.get("analysis_count", 0)
    }

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
        "analysis_count": user_dict.get("analysis_count", 0)
    }
